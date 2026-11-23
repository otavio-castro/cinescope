import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { criarChaveTitulo, storageService, type DadosLista } from '../servicos/storageService';
import { criarItemLista, tmdbService } from '../servicos/tmdbService';
import type { ItemLista, TipoTitulo, Titulo } from '../tipos';
import { useAuth } from './AuthContext';

interface ListaContextValor {
  itens: ItemLista[];
  carregando: boolean;
  sincronizando: boolean;
  estaSalvo: (tipo: TipoTitulo, id: number) => boolean;
  alternar: (titulo: Titulo) => void;
  remover: (tipo: TipoTitulo, id: number) => void;
  alternarAssistido: (tipo: TipoTitulo, id: number) => void;
  ehFavorito: (tipo: TipoTitulo, id: number) => boolean;
  alternarFavorito: (tipo: TipoTitulo, id: number) => void;
  sincronizar: () => Promise<void>;
}

interface EstadoLista {
  usuario: string | null;
  dados: DadosLista;
}

const DADOS_VAZIOS: DadosLista = { itens: [], favoritos: [], pendencias: {} };

const ListaContext = createContext<ListaContextValor | null>(null);

function chaveDoItem(item: { tipo: TipoTitulo; id: number }): string {
  return criarChaveTitulo(item.tipo, item.id);
}

function separarChave(chave: string): { tipo: TipoTitulo; id: number } {
  const [tipo, id] = chave.split('-');
  return { tipo: tipo as TipoTitulo, id: Number(id) };
}

type Pendencias = DadosLista['pendencias'];

function mesclarComRemoto(dados: DadosLista, remotos: ItemLista[], enviadas: Pendencias): DadosLista {
  const recentes = { ...enviadas, ...dados.pendencias };
  const locais = new Map(dados.itens.map((item) => [chaveDoItem(item), item]));
  const chavesRemotas = new Set(remotos.map(chaveDoItem));
  const aguardandoEnvio = dados.itens.filter(
    (item) => recentes[chaveDoItem(item)] === 'adicionar' && !chavesRemotas.has(chaveDoItem(item)),
  );
  const mantidos = remotos
    .filter((item) => recentes[chaveDoItem(item)] !== 'remover')
    .map((item) => ({ ...item, assistido: locais.get(chaveDoItem(item))?.assistido ?? false }));
  return { ...dados, itens: [...aguardandoEnvio, ...mantidos] };
}

export function ListaProvider({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  const conta = sessao?.conta ?? null;
  const sessionId = sessao?.sessionId ?? null;
  const usuario = sessao ? (conta ? String(conta.id) : 'visitante') : null;

  const [estado, setEstado] = useState<EstadoLista>({ usuario: null, dados: DADOS_VAZIOS });
  const [sincronizando, setSincronizando] = useState(false);
  const usuarioAtual = useRef<string | null>(null);
  const dadosAtuais = useRef(DADOS_VAZIOS);
  const filaSincronizacao = useRef<Promise<void>>(Promise.resolve());

  const pronto = usuario !== null && estado.usuario === usuario;
  const dados = pronto ? estado.dados : DADOS_VAZIOS;

  useEffect(() => {
    usuarioAtual.current = usuario;
    dadosAtuais.current = DADOS_VAZIOS;
    setEstado({ usuario: null, dados: DADOS_VAZIOS });
    if (!usuario) {
      return;
    }
    storageService.lerLista(usuario).then((salvos) => {
      if (usuarioAtual.current !== usuario) {
        return;
      }
      dadosAtuais.current = { ...DADOS_VAZIOS, ...salvos };
      setEstado({ usuario, dados: dadosAtuais.current });
    });
  }, [usuario]);

  const atualizar = useCallback((dono: string, transformar: (anterior: DadosLista) => DadosLista) => {
    if (usuarioAtual.current !== dono) {
      return;
    }
    dadosAtuais.current = transformar(dadosAtuais.current);
    setEstado({ usuario: dono, dados: dadosAtuais.current });
    storageService.salvarLista(dono, dadosAtuais.current).catch(() => undefined);
  }, []);

  const enviarPendencias = useCallback(async () => {
    if (!conta || !sessionId || !usuario || usuarioAtual.current !== usuario) {
      return;
    }
    for (const [chave, operacao] of Object.entries(dadosAtuais.current.pendencias)) {
      const { tipo, id } = separarChave(chave);
      await tmdbService.atualizarWatchlist(conta, sessionId, tipo, id, operacao === 'adicionar');
      atualizar(usuario, (anterior) => {
        if (anterior.pendencias[chave] !== operacao) {
          return anterior;
        }
        const pendencias = { ...anterior.pendencias };
        delete pendencias[chave];
        return { ...anterior, pendencias };
      });
    }
  }, [atualizar, conta, sessionId, usuario]);

  const baixarListaRemota = useCallback(async (enviadas: Pendencias) => {
    if (!conta || !sessionId || !usuario) {
      return;
    }
    const [filmes, series] = await Promise.all([
      tmdbService.buscarWatchlist(conta, sessionId, 'movie'),
      tmdbService.buscarWatchlist(conta, sessionId, 'tv'),
    ]);
    atualizar(usuario, (anterior) => mesclarComRemoto(anterior, [...filmes, ...series], enviadas));
  }, [atualizar, conta, sessionId, usuario]);

  const enfileirar = useCallback((tarefa: () => Promise<void>) => {
    const proxima = filaSincronizacao.current.catch(() => undefined).then(tarefa);
    filaSincronizacao.current = proxima;
    return proxima;
  }, []);

  const sincronizar = useCallback(async () => {
    if (!conta) {
      return;
    }
    setSincronizando(true);
    try {
      await enfileirar(async () => {
        const enviadas = dadosAtuais.current.pendencias;
        await enviarPendencias();
        await baixarListaRemota(enviadas);
      });
    } finally {
      setSincronizando(false);
    }
  }, [baixarListaRemota, conta, enfileirar, enviarPendencias]);

  useEffect(() => {
    if (pronto && conta) {
      sincronizar().catch(() => undefined);
    }
  }, [pronto, conta, sincronizar]);

  const definirSalvo = useCallback(
    (item: ItemLista, salvar: boolean) => {
      if (!usuario || !pronto) {
        return;
      }
      const chave = chaveDoItem(item);
      atualizar(usuario, (anterior) => {
        const restantes = anterior.itens.filter((existente) => chaveDoItem(existente) !== chave);
        return {
          ...anterior,
          itens: salvar ? [item, ...restantes] : restantes,
          pendencias: conta
            ? { ...anterior.pendencias, [chave]: salvar ? 'adicionar' : 'remover' }
            : anterior.pendencias,
        };
      });
      if (conta) {
        enfileirar(enviarPendencias).catch(() => undefined);
      }
    },
    [atualizar, conta, enfileirar, enviarPendencias, pronto, usuario],
  );

  const chavesSalvas = useMemo(() => new Set(dados.itens.map(chaveDoItem)), [dados.itens]);
  const chavesFavoritas = useMemo(() => new Set(dados.favoritos), [dados.favoritos]);

  const estaSalvo = useCallback(
    (tipo: TipoTitulo, id: number) => chavesSalvas.has(criarChaveTitulo(tipo, id)),
    [chavesSalvas],
  );

  const alternar = useCallback(
    (titulo: Titulo) => definirSalvo(criarItemLista(titulo), !estaSalvo(titulo.tipo, titulo.id)),
    [definirSalvo, estaSalvo],
  );

  const remover = useCallback(
    (tipo: TipoTitulo, id: number) => {
      const item = dados.itens.find((existente) => existente.tipo === tipo && existente.id === id);
      if (item) {
        definirSalvo(item, false);
      }
    },
    [dados.itens, definirSalvo],
  );

  const alternarAssistido = useCallback(
    (tipo: TipoTitulo, id: number) => {
      if (!usuario || !pronto) {
        return;
      }
      atualizar(usuario, (anterior) => ({
        ...anterior,
        itens: anterior.itens.map((item) =>
          item.tipo === tipo && item.id === id ? { ...item, assistido: !item.assistido } : item,
        ),
      }));
    },
    [atualizar, pronto, usuario],
  );

  const ehFavorito = useCallback(
    (tipo: TipoTitulo, id: number) => chavesFavoritas.has(criarChaveTitulo(tipo, id)),
    [chavesFavoritas],
  );

  const alternarFavorito = useCallback(
    (tipo: TipoTitulo, id: number) => {
      if (!usuario || !pronto) {
        return;
      }
      const chave = criarChaveTitulo(tipo, id);
      atualizar(usuario, (anterior) => ({
        ...anterior,
        favoritos: anterior.favoritos.includes(chave)
          ? anterior.favoritos.filter((favorito) => favorito !== chave)
          : [...anterior.favoritos, chave],
      }));
    },
    [atualizar, pronto, usuario],
  );

  const valor = useMemo(
    () => ({
      itens: dados.itens,
      carregando: usuario !== null && !pronto,
      sincronizando,
      estaSalvo,
      alternar,
      remover,
      alternarAssistido,
      ehFavorito,
      alternarFavorito,
      sincronizar,
    }),
    [
      dados.itens,
      usuario,
      pronto,
      sincronizando,
      estaSalvo,
      alternar,
      remover,
      alternarAssistido,
      ehFavorito,
      alternarFavorito,
      sincronizar,
    ],
  );

  return <ListaContext.Provider value={valor}>{children}</ListaContext.Provider>;
}

export function useLista(): ListaContextValor {
  const contexto = useContext(ListaContext);
  if (!contexto) {
    throw new Error('useLista deve ser usado dentro de ListaProvider');
  }
  return contexto;
}
