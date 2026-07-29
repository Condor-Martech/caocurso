/**
 * Datos reales de la LP Pet Condor (pet.condor.com.br).
 * Fuente: docs/GROUND_TRUTH.md — extraído del HTML, CSS y screenshot originales.
 * Todo el contenido va literal en pt-BR.
 */

export const SITE = {
  nome: 'Mês Pet Condor',
  url: 'https://pet.condor.com.br',
  ano: 2025,
  descricao:
    'No Mês do Pet da Condor: adote um AuMigo, inscreva seu pet no Cãocurso e confira todas as atrações.',
  regulamentoPdf: '/assets/docs/2025_Regulamento_Caocurso.pdf',
} as const;

/* -------------------------------------------------------------------------- */
/* Navegação                                                                   */
/* -------------------------------------------------------------------------- */

export const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Adote um Aumigo', href: '#adote' },
  { label: 'Cãocurso', href: '#caocurso' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Regulamento', href: SITE.regulamentoPdf, external: true },
] as const;

/* -------------------------------------------------------------------------- */
/* Eventos de adoção — 4 datas reais, agosto de 2025                           */
/* -------------------------------------------------------------------------- */

export interface Evento {
  id: number;
  dia: number;
  mes: string;
  local: string;
  horario: string;
}

export const eventos: Evento[] = [
  { id: 1, dia: 2, mes: 'AGOSTO', local: 'Condor Araucária BR', horario: '11h às 15h' },
  { id: 2, dia: 9, mes: 'AGOSTO', local: 'Condor Nilo Peçanha', horario: '11h às 15h' },
  { id: 3, dia: 16, mes: 'AGOSTO', local: 'Condor Água Verde', horario: '11h às 15h' },
  { id: 4, dia: 23, mes: 'AGOSTO', local: 'Condor Campo Comprido', horario: '11h às 15h' },
];

/* -------------------------------------------------------------------------- */
/* Requisitos — é UMA lista de 6 bullets dentro de um painel, NÃO três cards.  */
/* -------------------------------------------------------------------------- */

export const requisitos: string[] = [
  'Ter, no mínimo, 21 anos;',
  'Portar RG, CPF e comprovante de residência;',
  'Responder a uma entrevista sobre os motivos da adoção;',
  'Assinar e concordar com o termo de adoção;',
  'Ter condições financeiras para manter o animalzinho;',
  'Ter local seguro e adequado.',
];

/* -------------------------------------------------------------------------- */
/* Protetoras parceiras                                                        */
/* -------------------------------------------------------------------------- */

export interface Protetora {
  nome: string;
  logo: string;
  instagram: string;
}

export const protetoras: Protetora[] = [
  {
    nome: 'Instituto Seres & Vidas',
    logo: '/assets/images/InstitutoSeres-e-vidas.png',
    instagram: 'https://www.instagram.com/seres_vidas/',
  },
  {
    nome: 'Instituto SOS 4 Patas PR',
    logo: '/assets/images/sos-4-patas.png',
    instagram: 'https://www.instagram.com/sos4patas.pr/',
  },
  {
    nome: 'Marcia Santos Protetora de Animais',
    logo: '/assets/images/Marcia-Protetora-300x161.jpg',
    instagram: 'https://www.instagram.com/marciasantos.protetora/',
  },
];

/* -------------------------------------------------------------------------- */
/* Cãocurso — 30 de agosto                                                     */
/* -------------------------------------------------------------------------- */

export const caocurso = {
  data: '30 AGOSTO',
  local: 'Condor Água Verde',
  horario: '14h às 18h',
  inscricao: 'Período de inscrição: 09/08 a 24/08/2025.',
  // En el original figuraba como "Encerrado". Aquí el CTA dice "Inscreva-se"
  // y abre el modal: es la única desviación deliberada del original.
  encerrado: false,
  tagline: 'Seu pet é a estrela da nossa passarela.',
} as const;

/* -------------------------------------------------------------------------- */
/* Atrações                                                                    */
/* -------------------------------------------------------------------------- */

export interface Atracao {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}

export const atracoes: Atracao[] = [
  {
    id: 1,
    titulo: 'Camarim',
    descricao: 'Seu PetStar merece esse trato!',
    icone: '/assets/images/Capa-1.png',
  },
  {
    id: 2,
    titulo: 'Caricaturista',
    descricao: 'Não perca essa fofura.',
    icone: '/assets/images/Capa-1@2x.png',
  },
  {
    id: 3,
    titulo: 'Petfotos',
    descricao: 'Que tal uma foto impressa com seu pet?',
    icone: '/assets/images/eIOE-8@2x.png',
  },
];

/* -------------------------------------------------------------------------- */
/* Galeria — edição anterior (2024), 12 fotos                                  */
/* -------------------------------------------------------------------------- */

export const galeria = [
  '/assets/galeria/IMG_5140-scaled.jpg',
  '/assets/galeria/IMG_5142-scaled.jpg',
  '/assets/galeria/IMG_5152-scaled.jpg',
  '/assets/galeria/IMG_5162-scaled.jpg',
  '/assets/galeria/IMG_5168-scaled.jpg',
  '/assets/galeria/IMG_5173-scaled.jpg',
  '/assets/galeria/IMG_5177-scaled.jpg',
  '/assets/galeria/IMG_5185-scaled.jpg',
  '/assets/galeria/IMG_5205-scaled.jpg',
  '/assets/galeria/IMG_5208-scaled.jpg',
  '/assets/galeria/IMG_5551-scaled.jpg',
  '/assets/galeria/galeria-12.jpeg',
].map((src, i) => ({
  src,
  alt: `Cãocurso Condor 2024 — foto ${i + 1}`,
}));

/* -------------------------------------------------------------------------- */
/* Patrocínio e apoio                                                          */
/* -------------------------------------------------------------------------- */

export const patrocinio = [
  { nome: 'Friskies', logo: '/assets/patrocinadores/Logo-Friskies@2x.png' },
  { nome: 'Dog Chow', logo: '/assets/patrocinadores/Logo-dog-Chow.png' },
  { nome: 'Natural DOTS', logo: '/assets/patrocinadores/Image-2@2x-150x150.png' },
  { nome: 'Kelcat', logo: '/assets/patrocinadores/AF_LOGO_KELCAT-CROMIA-002@2x.png' },
  { nome: 'New DOTS', logo: '/assets/patrocinadores/Image-3.png' },
  { nome: 'Keldog', logo: '/assets/patrocinadores/AF_LOGO_KELDOG_CROMIA-002.png' },
  { nome: 'Purina ONE Cães', logo: '/assets/patrocinadores/Logo-Purina-One-Caes.png' },
  { nome: 'Purina ONE Gatos', logo: '/assets/patrocinadores/Logo-Purina-One-Gatos.png' },
];

export const apoio = [
  { nome: 'BRF Pet', logo: '/assets/patrocinadores/Image-5@2x.png' },
  { nome: 'Whiskas', logo: '/assets/patrocinadores/WHISKAS-LOGO.png' },
  {
    nome: 'Pedigree',
    logo: '/assets/patrocinadores/Pedigree-Rosette-2021-Blue-Wordmark-RGB.png',
  },
];

/* -------------------------------------------------------------------------- */
/* Redes sociais — perfis oficiais da Rede Condor                              */
/* -------------------------------------------------------------------------- */

export const socialLinks = [
  { nome: 'Facebook', url: 'https://www.facebook.com/RedeCondor/', icon: 'facebook' },
  { nome: 'Instagram', url: 'https://www.instagram.com/redecondor/', icon: 'instagram' },
  { nome: 'X', url: 'https://x.com/redecondor', icon: 'x' },
  { nome: 'YouTube', url: 'https://www.youtube.com/user/redecondor', icon: 'youtube' },
  {
    nome: 'LinkedIn',
    url: 'https://www.linkedin.com/company/rede-condor/',
    icon: 'linkedin',
  },
  { nome: 'TikTok', url: 'https://www.tiktok.com/@redecondor', icon: 'tiktok' },
];

export const copyright = '©Condor 2025. Todos os direitos reservados.';
