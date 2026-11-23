import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { storageService } from '../servicos/storageService';
import { ErroTmdb, tmdbService } from '../servicos/tmdbService';
import type { Sessao } from '../tipos';

interface AuthContextValor {
  sessao: Sessao | null;
  carregando: boolean;
  conectado: boolean;
  entrarComConta: () => Promise<void>;
  entrarComoVisitante: () => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValor | null>(null);

async function criarSessaoAutorizada(token: string): Promise<string> {
  try {
    return await tmdbService.criarSessao(token);
  } catch (erro) {
    if (erro instanceof ErroTmdb && erro.status === 401) {
      throw new ErroTmdb('A autorização não foi concluída no site do TMDB.', 401);
    }
    throw erro;
  }
}

async function obterMembroDesde(contaId: number): Promise<number> {
  const salvo = await storageService.lerMembroDesde(contaId);
  if (salvo) {
    return salvo;
  }
  const ano = new Date().getFullYear();
  await storageService.salvarMembroDesde(contaId, ano);
  return ano;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    storageService
      .lerSessao()
      .then(setSessao)
      .finally(() => setCarregando(false));
  }, []);

  const iniciarSessao = useCallback(async (nova: Sessao) => {
    await storageService.salvarSessao(nova);
    setSessao(nova);
  }, []);

  const entrarComConta = useCallback(async () => {
    const token = await tmdbService.criarTokenAcesso();
    const retorno = Linking.createURL('autorizado');
    await WebBrowser.openAuthSessionAsync(tmdbService.urlAutorizacao(token, retorno), retorno);
    const sessionId = await criarSessaoAutorizada(token);
    const conta = await tmdbService.buscarConta(sessionId);
    const membroDesde = await obterMembroDesde(conta.id);
    await iniciarSessao({ modo: 'conta', sessionId, conta, membroDesde });
  }, [iniciarSessao]);

  const entrarComoVisitante = useCallback(async () => {
    const sessionId = await tmdbService.criarSessaoVisitante();
    await iniciarSessao({ modo: 'visitante', sessionId, conta: null, membroDesde: new Date().getFullYear() });
  }, [iniciarSessao]);

  const sair = useCallback(async () => {
    if (sessao?.modo === 'conta') {
      tmdbService.encerrarSessao(sessao.sessionId).catch(() => undefined);
    }
    await storageService.removerSessao();
    setSessao(null);
  }, [sessao]);

  const valor = useMemo(
    () => ({
      sessao,
      carregando,
      conectado: sessao?.modo === 'conta',
      entrarComConta,
      entrarComoVisitante,
      sair,
    }),
    [sessao, carregando, entrarComConta, entrarComoVisitante, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return contexto;
}
