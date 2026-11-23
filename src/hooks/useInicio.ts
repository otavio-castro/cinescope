import { useCallback, useState } from 'react';

import { tmdbService } from '../servicos/tmdbService';
import type { FonteCatalogo, Genero, TipoTitulo, Titulo, TituloDetalhado } from '../tipos';
import { useRequisicao } from './useRequisicao';

export type FiltroInicio = 'todos' | TipoTitulo;

export interface SecaoInicio {
  titulo: string;
  fonte: FonteCatalogo;
  itens: Titulo[];
}

interface DadosInicio {
  destaque: Titulo | null;
  detalhe: TituloDetalhado | null;
  selo: string;
  secoes: SecaoInicio[];
}

interface DefinicaoSecao {
  titulo: string;
  selo: string;
  fonte: FonteCatalogo;
}

const EM_ALTA: DefinicaoSecao = { titulo: 'Em alta hoje', selo: '#1 em alta hoje', fonte: { tipo: 'emAlta' } };
const SERIES: DefinicaoSecao = {
  titulo: 'Séries populares',
  selo: '#1 entre as séries',
  fonte: { tipo: 'seriesPopulares' },
};
const LANCAMENTOS: DefinicaoSecao = { titulo: 'Lançamentos', selo: 'Lançamento', fonte: { tipo: 'lancamentos' } };

const SECOES: Record<FiltroInicio, DefinicaoSecao[]> = {
  todos: [EM_ALTA, SERIES],
  movie: [EM_ALTA, LANCAMENTOS],
  tv: [SERIES],
};

function definirSecoes(filtro: FiltroInicio, genero: Genero | null): DefinicaoSecao[] {
  if (!genero) {
    return SECOES[filtro];
  }
  const midia = filtro === 'tv' ? 'tv' : 'movie';
  return [
    {
      titulo: genero.nome,
      selo: `#1 em ${genero.nome}`,
      fonte: { tipo: 'genero', midia, generoId: genero.id },
    },
  ];
}

export function useInicio() {
  const [filtro, setFiltro] = useState<FiltroInicio>('todos');
  const [genero, setGenero] = useState<Genero | null>(null);

  const consultar = useCallback(async (): Promise<DadosInicio> => {
    const definicoes = definirSecoes(filtro, genero);
    const paginas = await Promise.all(
      definicoes.map((definicao) => tmdbService.buscarPaginaCatalogo(definicao.fonte, 1)),
    );
    const destaque = paginas[0].itens[0] ?? null;
    const detalhe = destaque
      ? await tmdbService.buscarDetalhe(destaque.tipo, destaque.id).catch(() => null)
      : null;
    return {
      destaque,
      detalhe,
      selo: definicoes[0].selo,
      secoes: definicoes.map(({ titulo, fonte }, indice) => ({
        titulo,
        fonte,
        itens: indice === 0 ? paginas[indice].itens.slice(1) : paginas[indice].itens,
      })),
    };
  }, [filtro, genero]);

  const requisicao = useRequisicao(consultar);

  const alternarFiltro = (escolhido: TipoTitulo) => {
    setGenero(null);
    setFiltro((atual) => (atual === escolhido ? 'todos' : escolhido));
  };

  return {
    ...requisicao,
    filtro,
    genero,
    alternarFiltro,
    escolherGenero: setGenero,
    midiaCategorias: (filtro === 'tv' ? 'tv' : 'movie') as TipoTitulo,
  };
}
