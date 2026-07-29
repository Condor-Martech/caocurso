import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Modal de INSCRIÇÃO NO CÃOCURSO.
 *
 * Objetivo: registrar UMA mascote, com sua foto, para que possa receber votos
 * no concurso. NÃO é um formulário de adoção — não pede endereço, quintal nem
 * "você tem outros pets?".
 *
 * Envia multipart/form-data para POST /api/inscricao, porque `petFoto` é um
 * arquivo e um arquivo não cabe num body JSON.
 */

const MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_LADO_PX = 600;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];

const IDADES = [
  'Filhote (até 1 ano)',
  'Adulto (1 a 7 anos)',
  'Idoso (mais de 7 anos)',
];

const ESTADO_INICIAL = {
  tutorNome: '',
  tutorEmail: '',
  tutorTelefone: '',
  petNome: '',
  petEspecie: '',
  petIdade: '',
  aceiteRegulamento: false,
  querNovidades: true,
};

/** Devolve a mensagem de erro do campo, ou '' se estiver válido. */
function validarCampo(nome, valor, extras = {}) {
  switch (nome) {
    case 'tutorNome':
      if (!valor.trim()) return 'Informe seu nome completo.';
      if (valor.trim().length < 3) return 'O nome deve ter ao menos 3 caracteres.';
      if (valor.trim().length > 100) return 'O nome é muito longo.';
      return '';

    case 'tutorEmail':
      if (!valor.trim()) return 'Informe seu e-mail.';
      // Validação intencionalmente permissiva: a confirmação real é o e-mail enviado.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()))
        return 'E-mail inválido.';
      return '';

    case 'tutorTelefone': {
      if (!valor.trim()) return 'Informe seu telefone.';
      const digitos = valor.replace(/\D/g, '');
      if (digitos.length < 10 || digitos.length > 13)
        return 'Telefone inválido. Ex.: (41) 99999-9999';
      return '';
    }

    case 'petNome':
      if (!valor.trim()) return 'Informe o nome do seu pet.';
      if (valor.trim().length > 60) return 'O nome é muito longo.';
      return '';

    case 'petEspecie':
      if (!valor) return 'Selecione uma opção.';
      return '';

    case 'petFoto':
      if (!extras.arquivo) return 'A foto do pet é obrigatória.';
      return extras.erroFoto || '';

    case 'aceiteRegulamento':
      if (!valor) return 'É necessário aceitar o regulamento para se inscrever.';
      return '';

    default:
      return '';
  }
}

export default function InscricaoModal() {
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [tocados, setTocados] = useState({});
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [erroFoto, setErroFoto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [erroEnvio, setErroEnvio] = useState('');

  const dialogRef = useRef(null);
  const primeiroCampoRef = useRef(null);
  const gatilhoAnteriorRef = useRef(null);
  const baseId = useId();
  const idDe = (n) => `${baseId}-${n}`;

  /* ---------------------------------------------------------------- abrir */

  const abrir = useCallback(() => {
    gatilhoAnteriorRef.current = document.activeElement;
    setAberto(true);
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    // devolve o foco ao elemento que abriu o modal
    if (gatilhoAnteriorRef.current instanceof HTMLElement) {
      gatilhoAnteriorRef.current.focus();
    }
  }, []);

  // Qualquer elemento com [data-abrir-inscricao] abre o modal.
  useEffect(() => {
    const gatilhos = document.querySelectorAll('[data-abrir-inscricao]');
    gatilhos.forEach((el) => el.addEventListener('click', abrir));
    return () => gatilhos.forEach((el) => el.removeEventListener('click', abrir));
  }, [abrir]);

  // Bloqueia o scroll do body, ESC fecha e o foco fica preso dentro do modal.
  useEffect(() => {
    if (!aberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    primeiroCampoRef.current?.focus();

    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        fechar();
        return;
      }
      if (e.key !== 'Tab') return;

      const focaveis = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focaveis?.length) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto, fechar]);

  // Libera a URL do preview para não vazar memória.
  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  /* --------------------------------------------------------------- campos */

  const aoMudar = (e) => {
    const { name, type, value, checked } = e.target;
    const novoValor = type === 'checkbox' ? checked : value;
    setDados((d) => ({ ...d, [name]: novoValor }));
    if (tocados[name]) {
      setErros((x) => ({ ...x, [name]: validarCampo(name, novoValor) }));
    }
  };

  const aoSair = (e) => {
    const { name, type, value, checked } = e.target;
    const v = type === 'checkbox' ? checked : value;
    setTocados((t) => ({ ...t, [name]: true }));
    setErros((x) => ({ ...x, [name]: validarCampo(name, v) }));
  };

  const aoEscolherFoto = (e) => {
    const arquivo = e.target.files?.[0];
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);

    if (!arquivo) {
      setFoto(null);
      setFotoPreview('');
      setErroFoto('');
      return;
    }

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setFoto(null);
      setFotoPreview('');
      const msg = 'Formato inválido. Use JPG, PNG ou WebP.';
      setErroFoto(msg);
      setErros((x) => ({ ...x, petFoto: msg }));
      return;
    }

    if (arquivo.size > MAX_FOTO_BYTES) {
      setFoto(null);
      setFotoPreview('');
      const msg = 'A foto deve ter no máximo 5 MB.';
      setErroFoto(msg);
      setErros((x) => ({ ...x, petFoto: msg }));
      return;
    }

    const url = URL.createObjectURL(arquivo);
    // Um lado mínimo garante que a foto renderize bem na galeria de votação.
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < MIN_LADO_PX && img.naturalHeight < MIN_LADO_PX) {
        const msg = `A foto é pequena demais (mínimo ${MIN_LADO_PX}px de lado).`;
        setErroFoto(msg);
        setErros((x) => ({ ...x, petFoto: msg }));
      } else {
        setErroFoto('');
        setErros((x) => ({ ...x, petFoto: '' }));
      }
    };
    img.src = url;

    setFoto(arquivo);
    setFotoPreview(url);
    setTocados((t) => ({ ...t, petFoto: true }));
  };

  const removerFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFoto(null);
    setFotoPreview('');
    setErroFoto('');
    setErros((x) => ({ ...x, petFoto: 'A foto do pet é obrigatória.' }));
  };

  /* -------------------------------------------------------------- submeter */

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErroEnvio('');

    const campos = [
      'tutorNome',
      'tutorEmail',
      'tutorTelefone',
      'petNome',
      'petEspecie',
      'aceiteRegulamento',
    ];

    const novosErros = {};
    for (const c of campos) novosErros[c] = validarCampo(c, dados[c]);
    novosErros.petFoto = validarCampo('petFoto', null, { arquivo: foto, erroFoto });

    setErros(novosErros);
    setTocados(
      [...campos, 'petFoto'].reduce((acc, c) => ({ ...acc, [c]: true }), {})
    );

    const primeiroErro = Object.entries(novosErros).find(([, msg]) => msg);
    if (primeiroErro) {
      const el = dialogRef.current?.querySelector(`[name="${primeiroErro[0]}"]`);
      el?.focus();
      return;
    }

    setEnviando(true);
    try {
      // multipart/form-data: obrigatório, a foto é um arquivo.
      const fd = new FormData();
      for (const [k, v] of Object.entries(dados)) fd.append(k, String(v));
      fd.append('petFoto', foto);

      const resposta = await fetch('/api/inscricao', { method: 'POST', body: fd });
      const json = await resposta.json().catch(() => ({}));

      if (!resposta.ok || !json.success) {
        throw new Error(json.message || 'Não foi possível concluir a inscrição.');
      }
      setSucesso(json);
    } catch (err) {
      setErroEnvio(
        err instanceof Error ? err.message : 'Não foi possível concluir a inscrição.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setDados(ESTADO_INICIAL);
    setErros({});
    setTocados({});
    setFoto(null);
    setFotoPreview('');
    setErroFoto('');
    setSucesso(null);
    setErroEnvio('');
    fechar();
  };

  if (!aberto) return null;

  /* ----------------------------------------------------------------- UI */

  const classeInput = (campo) =>
    [
      'form-input w-full rounded-lg border px-4 py-3 text-base text-[#3E3E3E] outline-none',
      erros[campo] && tocados[campo]
        ? 'is-error border-[#E20614]'
        : tocados[campo] && !erros[campo]
          ? 'is-valid border-[#00419A]'
          : 'border-[#D9D9D9]',
    ].join(' ');

  const Erro = ({ campo }) =>
    erros[campo] && tocados[campo] ? (
      <p
        id={idDe(`${campo}-erro`)}
        role="alert"
        className="mt-1.5 text-xs font-semibold text-[#E20614]"
      >
        {erros[campo]}
      </p>
    ) : null;

  const aria = (campo) => ({
    'aria-invalid': Boolean(erros[campo] && tocados[campo]),
    'aria-describedby':
      erros[campo] && tocados[campo] ? idDe(`${campo}-erro`) : undefined,
  });

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[3px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idDe('titulo')}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        style={{ animation: 'modalSlideIn 300ms cubic-bezier(0.4,0,0.2,1)' }}
      >
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#666] hover:bg-black/5"
        >
          &times;
        </button>

        {sucesso ? (
          /* ------------------------------------------------------ sucesso */
          <div className="py-6 text-center">
            <h2
              id={idDe('titulo')}
              className="text-2xl font-bold text-[#00419A]"
            >
              Inscrição enviada!
            </h2>
            <p className="mt-3 text-[#3E3E3E]">
              {sucesso.message ??
                `${dados.petNome} foi inscrito no Cãocurso. Assim que a foto for aprovada, o perfil entra na votação.`}
            </p>
            {sucesso.id && (
              <p className="mt-2 text-sm text-[#666]">
                Número da inscrição: <strong>{sucesso.id}</strong>
              </p>
            )}
            <p className="mt-2 text-sm text-[#666]">
              Enviamos a confirmação para <strong>{dados.tutorEmail}</strong>.
            </p>
            <button
              type="button"
              onClick={reiniciar}
              className="btn-lp mt-6 rounded-lg bg-[#00419A] px-8 py-3 font-bold text-white"
            >
              Fechar
            </button>
          </div>
        ) : (
          /* ----------------------------------------------------- formulário */
          <>
            <h2
              id={idDe('titulo')}
              className="pr-8 text-2xl font-bold text-[#00419A]"
            >
              Inscreva seu pet no Cãocurso
            </h2>
            <p className="mt-2 text-sm text-[#666]">
              Cadastre seu pet com uma foto para que ele possa receber votos.
            </p>

            <form onSubmit={aoSubmeter} noValidate className="mt-6 flex flex-col gap-5">
              {/* --------------------------------------------------- tutor */}
              <fieldset className="flex flex-col gap-4 border-0 p-0">
                <legend className="mb-1 text-xs font-bold tracking-wide text-[#00419A] uppercase">
                  Seus dados
                </legend>

                <div>
                  <label
                    htmlFor={idDe('tutorNome')}
                    className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                  >
                    Nome completo <span className="text-[#E20614]">*</span>
                  </label>
                  <input
                    ref={primeiroCampoRef}
                    id={idDe('tutorNome')}
                    name="tutorNome"
                    type="text"
                    value={dados.tutorNome}
                    onChange={aoMudar}
                    onBlur={aoSair}
                    placeholder="Ex.: Ana Souza"
                    className={classeInput('tutorNome')}
                    {...aria('tutorNome')}
                  />
                  <Erro campo="tutorNome" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={idDe('tutorEmail')}
                      className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                    >
                      E-mail <span className="text-[#E20614]">*</span>
                    </label>
                    <input
                      id={idDe('tutorEmail')}
                      name="tutorEmail"
                      type="email"
                      value={dados.tutorEmail}
                      onChange={aoMudar}
                      onBlur={aoSair}
                      placeholder="voce@exemplo.com"
                      className={classeInput('tutorEmail')}
                      {...aria('tutorEmail')}
                    />
                    <Erro campo="tutorEmail" />
                  </div>

                  <div>
                    <label
                      htmlFor={idDe('tutorTelefone')}
                      className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                    >
                      Telefone <span className="text-[#E20614]">*</span>
                    </label>
                    <input
                      id={idDe('tutorTelefone')}
                      name="tutorTelefone"
                      type="tel"
                      value={dados.tutorTelefone}
                      onChange={aoMudar}
                      onBlur={aoSair}
                      placeholder="(41) 99999-9999"
                      className={classeInput('tutorTelefone')}
                      {...aria('tutorTelefone')}
                    />
                    <Erro campo="tutorTelefone" />
                  </div>
                </div>
              </fieldset>

              {/* ----------------------------------------------------- pet */}
              <fieldset className="flex flex-col gap-4 border-0 p-0">
                <legend className="mb-1 text-xs font-bold tracking-wide text-[#00419A] uppercase">
                  Dados do pet
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={idDe('petNome')}
                      className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                    >
                      Nome do pet <span className="text-[#E20614]">*</span>
                    </label>
                    <input
                      id={idDe('petNome')}
                      name="petNome"
                      type="text"
                      value={dados.petNome}
                      onChange={aoMudar}
                      onBlur={aoSair}
                      placeholder="Ex.: Mel"
                      className={classeInput('petNome')}
                      {...aria('petNome')}
                    />
                    <Erro campo="petNome" />
                  </div>

                  <div>
                    <label
                      htmlFor={idDe('petIdade')}
                      className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                    >
                      Idade aproximada
                    </label>
                    <select
                      id={idDe('petIdade')}
                      name="petIdade"
                      value={dados.petIdade}
                      onChange={aoMudar}
                      className="form-input w-full rounded-lg border border-[#D9D9D9] px-4 py-3 text-base text-[#3E3E3E] outline-none"
                    >
                      <option value="">Selecione</option>
                      {IDADES.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <fieldset
                  className="border-0 p-0"
                  {...aria('petEspecie')}
                >
                  <legend className="mb-1.5 text-sm font-semibold text-[#00419A]">
                    Espécie <span className="text-[#E20614]">*</span>
                  </legend>
                  <div className="flex gap-6">
                    {['Cão', 'Gato'].map((op) => (
                      <label
                        key={op}
                        className="flex cursor-pointer items-center gap-2 text-sm text-[#3E3E3E]"
                      >
                        <input
                          type="radio"
                          name="petEspecie"
                          value={op}
                          checked={dados.petEspecie === op}
                          onChange={aoMudar}
                          onBlur={aoSair}
                          className="h-4 w-4 accent-[#00419A]"
                        />
                        {op}
                      </label>
                    ))}
                  </div>
                  <Erro campo="petEspecie" />
                </fieldset>
              </fieldset>

              {/* ---------------------------------------------------- foto */}
              <div>
                <label
                  htmlFor={idDe('petFoto')}
                  className="mb-1.5 block text-sm font-semibold text-[#00419A]"
                >
                  Foto do pet <span className="text-[#E20614]">*</span>
                </label>

                {fotoPreview ? (
                  <div className="foto-preview flex items-center gap-4 rounded-lg border border-[#D9D9D9] p-3">
                    <img
                      src={fotoPreview}
                      alt="Prévia da foto do seu pet"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#3E3E3E]">
                        {foto?.name}
                      </p>
                      <p className="text-xs text-[#666]">
                        {foto ? `${(foto.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removerFoto}
                      className="text-sm font-semibold text-[#E20614] hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={idDe('petFoto')}
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-[#9C9C9C] bg-[#F7F7F7] px-5 py-6 text-center hover:bg-[#F0F0F0]"
                  >
                    <span className="text-sm font-semibold text-[#00419A]">
                      Escolher foto
                    </span>
                    <span className="text-xs text-[#666]">
                      JPG, PNG ou WebP &middot; máx. 5 MB &middot; mín. 600px
                    </span>
                  </label>
                )}

                <input
                  id={idDe('petFoto')}
                  name="petFoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={aoEscolherFoto}
                  className="sr-only"
                  {...aria('petFoto')}
                />
                <Erro campo="petFoto" />
              </div>

              {/* ------------------------------------------------- aceites */}
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#3E3E3E]">
                  <input
                    type="checkbox"
                    name="aceiteRegulamento"
                    checked={dados.aceiteRegulamento}
                    onChange={aoMudar}
                    onBlur={aoSair}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#00419A]"
                    {...aria('aceiteRegulamento')}
                  />
                  <span>
                    Li e aceito o{' '}
                    <a
                      href="/assets/docs/2025_Regulamento_Caocurso.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#00419A] underline"
                    >
                      regulamento
                    </a>{' '}
                    e autorizo o uso da imagem do meu pet no site e nas redes da
                    Condor. <span className="text-[#E20614]">*</span>
                  </span>
                </label>
                <Erro campo="aceiteRegulamento" />

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#3E3E3E]">
                  <input
                    type="checkbox"
                    name="querNovidades"
                    checked={dados.querNovidades}
                    onChange={aoMudar}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#00419A]"
                  />
                  <span>Quero receber novidades do Mês Pet Condor.</span>
                </label>
              </div>

              {erroEnvio && (
                <p
                  role="alert"
                  className="rounded-lg border border-[#E20614] px-4 py-3 text-sm font-semibold text-[#E20614]"
                >
                  {erroEnvio}
                </p>
              )}

              {/* ------------------------------------------------- ações */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={enviando}
                  className="btn-lp flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#00419A] px-8 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando && <span className="spinner" aria-hidden="true" />}
                  {enviando ? 'Enviando…' : 'Inscreva-se'}
                </button>
                <button
                  type="button"
                  onClick={fechar}
                  className="btn-lp flex-1 rounded-lg border border-[#9C9C9C] bg-white px-8 py-3.5 font-bold text-[#00419A]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
