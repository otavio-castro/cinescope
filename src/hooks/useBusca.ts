import { useCallback, useMemo, useState } from 'react';

import { tmdbService } from '../servicos/tmdbService';
import type { ResultadoBusca } from '../tipos';
import { useDebounce } from './useDebounce';
import { useRequisicao } from './useRequisicao';

export type FiltroBusca = 'todos' | ResultadoBusca['tipo'];

const ATRASO_MS = 400;

export function useBusca() {
  const [texto, setTexto] = useState('');
  const [filtro, setFiltro] = useState<FiltroBusca>('todos');
  const consulta = useDebounce(texto.trim(), ATRASO_MS);

  const consultar = useCallback(async () => {
    if (!consulta) {
      return null;
    }
    const [resultados, generos] = await Promise.all([
      tmdbService.buscarMulti(consulta),
      tmdbService.mapearGeneros().catch(() => new Map<number, string>()),
    ]);
    return { resultados, generos };
  }, [consulta]);

  const { dados, carregando, erro, recarregar } = useRequisicao(consultar);

  const resultados = useMemo(
    () => (dados?.resultados ?? []).filter((item) => filtro === 'todos' || item.tipo === filtro),
    [dados, filtro],
  );

  return {
    texto,
    setTexto,
    filtro,
    setFiltro,
    consulta,
    resultados,
    generos: dados?.generos ?? null,
    carregando: carregando && consulta !== '',
    erro,
    recarregar,
  };
}
