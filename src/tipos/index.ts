export type TipoTitulo = 'movie' | 'tv';

export interface Titulo {
  id: number;
  tipo: TipoTitulo;
  titulo: string;
  ano: string;
  nota: number;
  votos: number;
  posterPath: string | null;
  backdropPath: string | null;
  generoIds: number[];
}

export interface Pessoa {
  id: number;
  tipo: 'person';
  nome: string;
  departamento: string;
  conhecidoPor: string[];
}

export type ResultadoBusca = Titulo | Pessoa;

export interface Genero {
  id: number;
  nome: string;
}

export interface MembroElenco {
  id: number;
  nome: string;
  personagem: string;
}

export interface TituloDetalhado extends Titulo {
  tituloOriginal: string;
  sinopse: string;
  generos: Genero[];
  duracao: string;
  rotuloDuracao: string;
  lancamento: string;
  classificacao: string;
  elenco: MembroElenco[];
  trailerUrl: string | null;
}

export interface ItemLista {
  id: number;
  tipo: TipoTitulo;
  titulo: string;
  ano: string;
  nota: number;
  posterPath: string | null;
  generoIds: number[];
  assistido: boolean;
}

export interface Conta {
  id: number;
  nome: string;
  usuario: string;
}

export interface Sessao {
  modo: 'conta' | 'visitante';
  sessionId: string;
  conta: Conta | null;
  membroDesde: number;
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  totalPaginas: number;
}

export type FonteCatalogo =
  | { tipo: 'emAlta' }
  | { tipo: 'seriesPopulares' }
  | { tipo: 'lancamentos' }
  | { tipo: 'genero'; midia: TipoTitulo; generoId: number }
  | { tipo: 'recomendacoes'; midia: TipoTitulo; tituloId: number }
  | { tipo: 'pessoa'; pessoaId: number };
