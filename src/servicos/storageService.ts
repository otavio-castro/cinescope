import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ItemLista, Sessao, TipoTitulo } from '../tipos';

const PREFIXO = '@cinescope';
const CHAVE_SESSAO = `${PREFIXO}/sessao`;

export type OperacaoPendente = 'adicionar' | 'remover';

export interface DadosLista {
  itens: ItemLista[];
  favoritos: string[];
  pendencias: Record<string, OperacaoPendente>;
}

export interface Preferencias {
  notificacoes: boolean;
}

async function ler<T>(chave: string): Promise<T | null> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? (JSON.parse(texto) as T) : null;
  } catch {
    return null;
  }
}

async function gravar<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export function criarChaveTitulo(tipo: TipoTitulo, id: number): string {
  return `${tipo}-${id}`;
}

export const storageService = {
  lerSessao: () => ler<Sessao>(CHAVE_SESSAO),
  salvarSessao: (sessao: Sessao) => gravar(CHAVE_SESSAO, sessao),
  removerSessao: () => AsyncStorage.removeItem(CHAVE_SESSAO),
  lerLista: (usuario: string) => ler<DadosLista>(`${PREFIXO}/lista/${usuario}`),
  salvarLista: (usuario: string, dados: DadosLista) => gravar(`${PREFIXO}/lista/${usuario}`, dados),
  lerPreferencias: () => ler<Preferencias>(`${PREFIXO}/preferencias`),
  salvarPreferencias: (dados: Preferencias) => gravar(`${PREFIXO}/preferencias`, dados),
  lerMembroDesde: (contaId: number) => ler<number>(`${PREFIXO}/membro/${contaId}`),
  salvarMembroDesde: (contaId: number, ano: number) => gravar(`${PREFIXO}/membro/${contaId}`, ano),
};
