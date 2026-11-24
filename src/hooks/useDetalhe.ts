import { useCallback } from 'react';

import { useAuth } from '../contextos/AuthContext';
import { tmdbService } from '../servicos/tmdbService';
import type { TipoTitulo } from '../tipos';
import { useRequisicao } from './useRequisicao';

export function useDetalhe(tipo: TipoTitulo, id: number) {
  const { sessao } = useAuth();
  const consultar = useCallback(() => tmdbService.buscarDetalhe(tipo, id), [tipo, id]);
  const requisicao = useRequisicao(consultar);

  const avaliar = useCallback(
    async (nota: number) => {
      if (sessao?.modo === 'conta') {
        await tmdbService.avaliar(sessao.sessionId, tipo, id, nota);
      }
    },
    [sessao, tipo, id],
  );

  return { ...requisicao, avaliar };
}
