import { useCallback } from 'react';

import { tmdbService } from '../servicos/tmdbService';
import type { ItemLista, TipoTitulo } from '../tipos';
import { useRequisicao } from './useRequisicao';

export function useSugestao(base: ItemLista | undefined) {
  const tipo: TipoTitulo = base?.tipo ?? 'movie';
  const id = base?.id;

  const consultar = useCallback(async () => {
    if (id === undefined) {
      return null;
    }
    const pagina = await tmdbService.buscarPaginaCatalogo({ tipo: 'recomendacoes', midia: tipo, tituloId: id }, 1);
    return pagina.itens.find((item) => item.posterPath) ?? null;
  }, [tipo, id]);

  return useRequisicao(consultar).dados;
}
