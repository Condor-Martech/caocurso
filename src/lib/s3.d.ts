/**
 * Tipos de `s3.mjs`.
 *
 * O módulo é `.mjs` e não `.ts` por um motivo prático: `scripts/limpar-inscricoes.mjs`
 * roda fora do Astro, com `node` pelado, e precisa exatamente das mesmas quatro
 * operações. Em TypeScript teria de duplicá-las — que é o tipo de duplicação que
 * um dia diverge e ninguém percebe até que apaga a foto errada.
 *
 * Este arquivo existe para que o `astro check` continue vendo tipos de verdade
 * do lado do servidor.
 */

export interface OpcoesClienteS3 {
  /** Com esquema e sem barra final: `https://s3.cndr.me`. */
  endpoint: string;
  /** ⚠️ No MinIO da Condor é `us-east`, NÃO `us-east-1`. */
  regiao: string;
  accessKey: string;
  secretKey: string;
}

export interface ClienteS3 {
  /** Sobe um objeto. Lança se o servidor recusar. */
  subir(caminho: string, bytes: Buffer | Uint8Array, contentType?: string): Promise<true>;

  /**
   * URL de leitura assinada. **Não faz nenhuma requisição**: é aritmética, e
   * por isso não sabe se o objeto existe.
   */
  urlAssinada(caminho: string, segundos?: number): string;

  /** Apaga um objeto. Um 404 conta como apagado. */
  apagar(caminho: string): Promise<true>;

  /** Keys de um bucket sob um prefixo, seguindo a paginação. */
  listar(bucket: string, prefixo?: string, limite?: number): Promise<string[]>;
}

export function criarClienteS3(opcoes: OpcoesClienteS3): ClienteS3;
