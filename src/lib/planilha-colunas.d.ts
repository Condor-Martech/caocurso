/**
 * Os tipos de `planilha-colunas.mjs`, para o `astro check`.
 *
 * Mesmo arranjo que `s3.d.ts`: o módulo é `.mjs` para que o script de
 * manutenção —node puro, sem Astro— possa importar exatamente o mesmo arquivo
 * que o servidor. O TypeScript não deduz nada de um `.mjs`, então os tipos vêm
 * aqui à mão.
 */

/** Uma ficha tal como sai do `select(SELECT_FICHAS)`. */
export interface FichaCrua {
  id: string;
  tutor_nome: string;
  tutor_nascimento: string | null;
  tutor_cpf: string | null;
  tutor_email: string;
  tutor_telefone: string;
  pet_nome: string;
  pet_raca: string | null;
  pet_sexo: string | null;
  pet_descricao: string | null;
  criado_em: string;
}

export declare const COLUNAS: readonly string[];
export declare const SELECT_FICHAS: string;
export declare function formatarCpf(cpf: string | null): string;
export declare function formatarTelefone(tel: string | null): string;
export declare function formatarNascimento(data: string | null): string;
export declare function montarLinhas(registros: FichaCrua[] | null, base: string): string[][];
