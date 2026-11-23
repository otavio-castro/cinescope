import type {
  Conta,
  FonteCatalogo,
  Genero,
  ItemLista,
  Pagina,
  Pessoa,
  ResultadoBusca,
  TipoTitulo,
  Titulo,
  TituloDetalhado,
} from '../tipos';
import { formatarClassificacao, formatarData, formatarDuracao, obterAno } from '../utils/formatadores';

const URL_BASE = 'https://api.themoviedb.org/3';
const URL_IMAGENS = 'https://image.tmdb.org/t/p';
const IDIOMA = 'pt-BR';
const TEMPO_LIMITE_MS = 12000;
const TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

type Parametros = Record<string, string | number | boolean>;

interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'DELETE';
  parametros?: Parametros;
  corpo?: unknown;
}

interface TituloApi {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  known_for_department?: string;
  known_for?: TituloApi[];
}

interface PaginaApi {
  page: number;
  total_pages: number;
  total_results: number;
  results: TituloApi[];
}

interface VideoApi {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  iso_639_1?: string;
}

interface DetalheApi extends TituloApi {
  original_title?: string;
  original_name?: string;
  overview?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  credits?: { cast: { id: number; name: string; character: string }[] };
  videos?: { results: VideoApi[] };
  release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
}

const DEPARTAMENTOS: Record<string, string> = {
  Acting: 'Atuação',
  Directing: 'Direção',
  Writing: 'Roteiro',
  Production: 'Produção',
  Sound: 'Som',
  Camera: 'Fotografia',
  Editing: 'Edição',
  Art: 'Arte',
  Crew: 'Equipe',
  Creator: 'Criação',
  Lighting: 'Iluminação',
  'Costume & Make-Up': 'Figurino e maquiagem',
  'Visual Effects': 'Efeitos visuais',
};

export class ErroTmdb extends Error {
  readonly status: number;

  constructor(mensagem: string, status = 0) {
    super(mensagem);
    this.name = 'ErroTmdb';
    this.status = status;
  }
}

function mensagemPorStatus(status: number): string {
  if (status === 401) {
    return 'Acesso ao TMDB não autorizado. Confira o token ou entre novamente.';
  }
  if (status === 404) {
    return 'Conteúdo não encontrado no TMDB.';
  }
  if (status === 429) {
    return 'Muitas consultas em pouco tempo. Aguarde um instante.';
  }
  return 'O TMDB está indisponível no momento.';
}

function montarUrl(caminho: string, parametros: Parametros = {}): string {
  const consulta = Object.entries({ language: IDIOMA, ...parametros })
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`)
    .join('&');
  return `${URL_BASE}${caminho}?${consulta}`;
}

async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  if (!TOKEN) {
    throw new ErroTmdb('Token do TMDB não configurado. Crie o arquivo .env conforme o README.');
  }
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(montarUrl(caminho, opcoes.parametros), {
      method: opcoes.metodo ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
      signal: controlador.signal,
    });
    if (!resposta.ok) {
      throw new ErroTmdb(mensagemPorStatus(resposta.status), resposta.status);
    }
    return (await resposta.json()) as T;
  } catch (erro) {
    if (erro instanceof ErroTmdb) {
      throw erro;
    }
    throw new ErroTmdb('Não foi possível conectar. Verifique a internet e tente novamente.');
  } finally {
    clearTimeout(temporizador);
  }
}

function converterTitulo(dados: TituloApi, tipoPadrao: TipoTitulo): Titulo {
  const tipo = dados.media_type === 'movie' || dados.media_type === 'tv' ? dados.media_type : tipoPadrao;
  return {
    id: dados.id,
    tipo,
    titulo: dados.title ?? dados.name ?? 'Sem título',
    ano: obterAno(dados.release_date ?? dados.first_air_date),
    nota: dados.vote_average ?? 0,
    votos: dados.vote_count ?? 0,
    posterPath: dados.poster_path ?? null,
    backdropPath: dados.backdrop_path ?? null,
    generoIds: dados.genre_ids ?? [],
  };
}

function converterPessoa(dados: TituloApi): Pessoa {
  return {
    id: dados.id,
    tipo: 'person',
    nome: dados.name ?? 'Sem nome',
    departamento: DEPARTAMENTOS[dados.known_for_department ?? ''] ?? 'Equipe',
    conhecidoPor: (dados.known_for ?? [])
      .map((obra) => obra.title ?? obra.name ?? '')
      .filter(Boolean)
      .slice(0, 2),
  };
}

function converterPagina(dados: PaginaApi, tipo: TipoTitulo): Pagina<Titulo> {
  return {
    itens: dados.results.map((item) => converterTitulo(item, tipo)),
    pagina: dados.page,
    totalPaginas: dados.total_pages,
  };
}

function escolherTrailer(videos: VideoApi[] = []): string | null {
  const pontuar = (video: VideoApi) =>
    (video.type === 'Trailer' ? 4 : 0) + (video.iso_639_1 === 'pt' ? 2 : 0) + (video.official ? 1 : 0);
  const [melhor] = videos
    .filter((video) => video.site === 'YouTube' && ['Trailer', 'Teaser'].includes(video.type))
    .sort((a, b) => pontuar(b) - pontuar(a));
  return melhor ? `https://www.youtube.com/watch?v=${melhor.key}` : null;
}

function obterCertificacao(dados: DetalheApi): string | undefined {
  const datas = dados.release_dates?.results.find((item) => item.iso_3166_1 === 'BR');
  const certificacao = datas?.release_dates.find((item) => item.certification)?.certification;
  return certificacao ?? dados.content_ratings?.results.find((item) => item.iso_3166_1 === 'BR')?.rating;
}

function formatarTemporadas(quantidade = 0): string {
  if (!quantidade) {
    return '—';
  }
  return quantidade === 1 ? '1 temporada' : `${quantidade} temporadas`;
}

function converterDetalhe(dados: DetalheApi, tipo: TipoTitulo): TituloDetalhado {
  return {
    ...converterTitulo(dados, tipo),
    generoIds: (dados.genres ?? []).map((genero) => genero.id),
    tituloOriginal: dados.original_title ?? dados.original_name ?? '',
    sinopse: dados.overview || 'Sinopse não disponível em português.',
    generos: (dados.genres ?? []).map((genero) => ({ id: genero.id, nome: genero.name })),
    rotuloDuracao: tipo === 'movie' ? 'Duração' : 'Temporadas',
    duracao: tipo === 'movie' ? formatarDuracao(dados.runtime ?? 0) : formatarTemporadas(dados.number_of_seasons),
    lancamento: formatarData(dados.release_date ?? dados.first_air_date),
    classificacao: formatarClassificacao(obterCertificacao(dados)),
    elenco: (dados.credits?.cast ?? []).map((membro) => ({
      id: membro.id,
      nome: membro.name,
      personagem: membro.character,
    })),
    trailerUrl: escolherTrailer(dados.videos?.results),
  };
}

const cacheGeneros = new Map<TipoTitulo, Promise<Genero[]>>();

function listarGeneros(tipo: TipoTitulo): Promise<Genero[]> {
  const emCache = cacheGeneros.get(tipo);
  if (emCache) {
    return emCache;
  }
  const consulta = requisitar<{ genres: { id: number; name: string }[] }>(`/genre/${tipo}/list`)
    .then((dados) => dados.genres.map((genero) => ({ id: genero.id, nome: genero.name })))
    .catch((erro) => {
      cacheGeneros.delete(tipo);
      throw erro;
    });
  cacheGeneros.set(tipo, consulta);
  return consulta;
}

async function buscarObrasDaPessoa(pessoaId: number): Promise<Pagina<Titulo>> {
  const creditos = await requisitar<{ cast: TituloApi[]; crew: TituloApi[] }>(`/person/${pessoaId}/combined_credits`);
  const unicos = new Map<string, TituloApi>();
  [...creditos.crew, ...creditos.cast].forEach((obra) => unicos.set(`${obra.media_type}-${obra.id}`, obra));
  const itens = [...unicos.values()]
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    .map((obra) => converterTitulo(obra, 'movie'));
  return { itens, pagina: 1, totalPaginas: 1 };
}

async function buscarPaginaCatalogo(fonte: FonteCatalogo, pagina: number): Promise<Pagina<Titulo>> {
  const consultar = async (caminho: string, tipo: TipoTitulo, extras: Parametros = {}) =>
    converterPagina(await requisitar<PaginaApi>(caminho, { parametros: { page: pagina, ...extras } }), tipo);

  switch (fonte.tipo) {
    case 'emAlta':
      return consultar('/trending/movie/day', 'movie');
    case 'seriesPopulares':
      return consultar('/tv/popular', 'tv');
    case 'lancamentos':
      return consultar('/movie/upcoming', 'movie', { region: 'BR' });
    case 'genero':
      return consultar(`/discover/${fonte.midia}`, fonte.midia, {
        with_genres: fonte.generoId,
        sort_by: 'popularity.desc',
      });
    case 'recomendacoes':
      return consultar(`/${fonte.midia}/${fonte.tituloId}/recommendations`, fonte.midia);
    case 'pessoa':
      return buscarObrasDaPessoa(fonte.pessoaId);
  }
}

async function buscarWatchlist(conta: Conta, sessionId: string, tipo: TipoTitulo): Promise<ItemLista[]> {
  const caminho = `/account/${conta.id}/watchlist/${tipo === 'movie' ? 'movies' : 'tv'}`;
  const itens: ItemLista[] = [];
  let pagina = 1;
  let totalPaginas = 1;
  do {
    const dados = await requisitar<PaginaApi>(caminho, {
      parametros: { session_id: sessionId, page: pagina, sort_by: 'created_at.desc' },
    });
    totalPaginas = dados.total_pages;
    dados.results.forEach((resultado) => itens.push(criarItemLista(converterTitulo(resultado, tipo))));
    pagina += 1;
  } while (pagina <= totalPaginas);
  return itens;
}

export function criarItemLista(titulo: Titulo): ItemLista {
  return {
    id: titulo.id,
    tipo: titulo.tipo,
    titulo: titulo.titulo,
    ano: titulo.ano,
    nota: titulo.nota,
    posterPath: titulo.posterPath,
    generoIds: titulo.generoIds,
    assistido: false,
  };
}

export function urlImagem(caminho: string | null, tamanho: 'w342' | 'w500' | 'w780' = 'w500'): string | null {
  return caminho ? `${URL_IMAGENS}/${tamanho}${caminho}` : null;
}

export const tmdbService = {
  criarTokenAcesso: () =>
    requisitar<{ request_token: string }>('/authentication/token/new').then((dados) => dados.request_token),

  criarSessao: (token: string) =>
    requisitar<{ session_id: string }>('/authentication/session/new', {
      metodo: 'POST',
      corpo: { request_token: token },
    }).then((dados) => dados.session_id),

  criarSessaoVisitante: () =>
    requisitar<{ guest_session_id: string }>('/authentication/guest_session/new').then(
      (dados) => dados.guest_session_id,
    ),

  encerrarSessao: (sessionId: string) =>
    requisitar('/authentication/session', { metodo: 'DELETE', corpo: { session_id: sessionId } }),

  urlAutorizacao: (token: string, retorno: string) =>
    `https://www.themoviedb.org/authenticate/${token}?redirect_to=${encodeURIComponent(retorno)}`,

  buscarConta: async (sessionId: string): Promise<Conta> => {
    const dados = await requisitar<{ id: number; name: string; username: string }>('/account', {
      parametros: { session_id: sessionId },
    });
    return { id: dados.id, nome: dados.name || dados.username, usuario: dados.username };
  },

  buscarDetalhe: async (tipo: TipoTitulo, id: number): Promise<TituloDetalhado> => {
    const classificacao = tipo === 'movie' ? 'release_dates' : 'content_ratings';
    const dados = await requisitar<DetalheApi>(`/${tipo}/${id}`, {
      parametros: {
        append_to_response: `credits,videos,${classificacao}`,
        include_video_language: 'pt,en,null',
      },
    });
    return converterDetalhe(dados, tipo);
  },

  buscarTrailer: async (tipo: TipoTitulo, id: number): Promise<string | null> => {
    const dados = await requisitar<{ results: VideoApi[] }>(`/${tipo}/${id}/videos`, {
      parametros: { include_video_language: 'pt,en,null' },
    });
    return escolherTrailer(dados.results);
  },

  buscarMulti: async (consulta: string): Promise<ResultadoBusca[]> => {
    const dados = await requisitar<PaginaApi>('/search/multi', {
      parametros: { query: consulta, page: 1, include_adult: false },
    });
    return dados.results.map((item) =>
      item.media_type === 'person' ? converterPessoa(item) : converterTitulo(item, 'movie'),
    );
  },

  listarGeneros,

  mapearGeneros: async (): Promise<Map<number, string>> => {
    const [filmes, series] = await Promise.all([listarGeneros('movie'), listarGeneros('tv')]);
    return new Map([...series, ...filmes].map((genero) => [genero.id, genero.nome]));
  },

  buscarPaginaCatalogo,

  buscarWatchlist,

  atualizarWatchlist: (conta: Conta, sessionId: string, tipo: TipoTitulo, id: number, salvar: boolean) =>
    requisitar(`/account/${conta.id}/watchlist`, {
      metodo: 'POST',
      parametros: { session_id: sessionId },
      corpo: { media_type: tipo, media_id: id, watchlist: salvar },
    }),

  avaliar: (sessionId: string, tipo: TipoTitulo, id: number, nota: number) =>
    requisitar(`/${tipo}/${id}/rating`, {
      metodo: 'POST',
      parametros: { session_id: sessionId },
      corpo: { value: nota },
    }),

  contarAvaliacoes: async (conta: Conta, sessionId: string): Promise<number> => {
    const parametros = { session_id: sessionId };
    const [filmes, series] = await Promise.all([
      requisitar<PaginaApi>(`/account/${conta.id}/rated/movies`, { parametros }),
      requisitar<PaginaApi>(`/account/${conta.id}/rated/tv`, { parametros }),
    ]);
    return filmes.total_results + series.total_results;
  },
};
