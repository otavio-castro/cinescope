import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contextos/AuthContext';
import { useLista } from '../contextos/ListaContext';
import { storageService } from '../servicos/storageService';
import { tmdbService } from '../servicos/tmdbService';
import type { ItemLista } from '../tipos';
import { useRequisicao } from './useRequisicao';

const MAXIMO_GENEROS = 6;

function ordenarGeneros(itens: ItemLista[], nomes: Map<number, string>): string[] {
  const frequencia = new Map<string, number>();
  itens
    .flatMap((item) => item.generoIds)
    .forEach((id) => {
      const nome = nomes.get(id);
      if (nome) {
        frequencia.set(nome, (frequencia.get(nome) ?? 0) + 1);
      }
    });
  return [...frequencia.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAXIMO_GENEROS)
    .map(([nome]) => nome);
}

export function usePerfil() {
  const { sessao } = useAuth();
  const { itens } = useLista();
  const [notificacoes, setNotificacoes] = useState(true);

  const consultar = useCallback(async () => {
    const [generos, avaliacoes] = await Promise.all([
      tmdbService.mapearGeneros(),
      sessao?.conta ? tmdbService.contarAvaliacoes(sessao.conta, sessao.sessionId) : 0,
    ]);
    return { generos, avaliacoes };
  }, [sessao]);

  const { dados, carregando, erro, recarregar } = useRequisicao(consultar);

  useEffect(() => {
    storageService.lerPreferencias().then((salvas) => {
      if (salvas) {
        setNotificacoes(salvas.notificacoes);
      }
    });
  }, []);

  const alternarNotificacoes = () => {
    const proximo = !notificacoes;
    setNotificacoes(proximo);
    storageService.salvarPreferencias({ notificacoes: proximo }).catch(() => undefined);
  };

  const generosFavoritos = useMemo(
    () => (dados ? ordenarGeneros(itens, dados.generos) : []),
    [dados, itens],
  );

  return {
    assistidos: itens.filter((item) => item.assistido).length,
    naLista: itens.length,
    avaliacoes: dados?.avaliacoes ?? 0,
    generosFavoritos,
    notificacoes,
    alternarNotificacoes,
    carregando,
    erro,
    recarregar,
  };
}
