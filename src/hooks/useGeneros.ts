import { useCallback } from 'react';

import { tmdbService } from '../servicos/tmdbService';
import type { TipoTitulo } from '../tipos';
import { useRequisicao } from './useRequisicao';

export function useGeneros(midia: TipoTitulo) {
  const consultar = useCallback(() => tmdbService.listarGeneros(midia), [midia]);
  return useRequisicao(consultar);
}
