import sharp from 'sharp';

/**
 * REPROCESSAMENTO DA FOTO DO PET.
 *
 * Toda foto que chega passa por aqui antes de tocar o storage. Resolve três
 * coisas de uma vez, e nenhuma é opcional:
 *
 * 1. **Tira o EXIF.** As fotos de celular levam coordenadas de GPS por padrão,
 *    e uma foto de pet é feita em casa: o arquivo cru contém o endereço do
 *    tutor. Essa foto vai acabar numa planilha compartilhada com o júri e com
 *    o time de CRM. O `sharp` descarta metadados a menos que se peça o
 *    contrário, então basta não pedir — mas o `.rotate()` sem argumentos tem
 *    de vir antes, para aplicar a orientação do EXIF à imagem *antes* de o
 *    EXIF sumir. Sem isso, metade das fotos de celular ficam deitadas.
 *
 * 2. **Confere que é mesmo uma imagem.** O `File.type` que o navegador manda é
 *    o que o cliente disser que é: renomear `virus.exe` para `foto.jpg` já
 *    engana o `type`. Aqui se olham os primeiros bytes, que não se falsificam
 *    sem deixar de ser o formato.
 *
 * 3. **Normaliza o peso.** Entra o que o celular produzir —um Samsung de 200MP
 *    manda 40 MB— e sai sempre WebP de ~250 KB. É o que torna irrelevante o
 *    tamanho de entrada: o que se guarda é sempre o mesmo.
 */

/** Lado maior da imagem guardada. Suficiente para projetar no dia do evento. */
const LADO_MAXIMO = 1600;

/** 82 é o joelho da curva do WebP: acima disso pesa mais sem se ver melhor. */
const QUALIDADE = 82;

export type FormatoAceito = 'jpeg' | 'png' | 'webp';

export interface FotoProcessada {
  bytes: Buffer;
  largura: number;
  altura: number;
  /** Sempre 'image/webp': é o único formato que sai daqui. */
  contentType: 'image/webp';
}

/**
 * O formato real do arquivo, lido dos primeiros bytes. `null` se não for
 * nenhum dos três que aceitamos.
 *
 * Não se usa o `type` que o navegador declara: é um texto que o cliente
 * escolhe. Estes bytes fazem parte da definição do formato — mudá-los é deixar
 * de ser um JPEG.
 */
export function formatoReal(bytes: Uint8Array): FormatoAceito | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: "RIFF" …4 bytes de tamanho… "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export class FotoInvalida extends Error {}

/**
 * Recodifica para WebP, sem metadados e com o lado maior em {@link LADO_MAXIMO}.
 *
 * `withoutEnlargement` evita esticar uma foto pequena: se alguém manda 400 px,
 * sai com 400 px em vez de um borrão de 1600.
 *
 * Lança {@link FotoInvalida} se os bytes não forem uma imagem utilizável —
 * inclusive quando os primeiros bytes convencem mas o resto do arquivo está
 * truncado, que é o caso de um upload interrompido.
 */
export async function processarFoto(bytes: Uint8Array): Promise<FotoProcessada> {
  if (!formatoReal(bytes)) {
    throw new FotoInvalida('O arquivo enviado não é uma imagem JPG, PNG ou WebP.');
  }

  try {
    const { data, info } = await sharp(bytes)
      // Antes de tudo: aplica a orientação do EXIF à imagem. Depois disso o
      // EXIF pode sumir sem deixar a foto deitada.
      .rotate()
      .resize({
        width: LADO_MAXIMO,
        height: LADO_MAXIMO,
        fit: 'inside',
        withoutEnlargement: true,
      })
      // Sem `.withMetadata()`: é justamente o que descarta EXIF, GPS e ICC.
      .webp({ quality: QUALIDADE })
      .toBuffer({ resolveWithObject: true });

    return {
      bytes: data,
      largura: info.width,
      altura: info.height,
      contentType: 'image/webp',
    };
  } catch (e) {
    if (e instanceof FotoInvalida) throw e;
    throw new FotoInvalida('Não foi possível processar a imagem enviada.');
  }
}
