import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { FonteCatalogo, MembroElenco, TipoTitulo } from '../tipos';

export type AbasParams = {
  Inicio: undefined;
  Buscar: undefined;
  MinhaLista: undefined;
  Perfil: undefined;
};

export type PilhaParams = {
  Entrada: undefined;
  Abas: NavigatorScreenParams<AbasParams> | undefined;
  Detalhe: { tipo: TipoTitulo; id: number };
  Catalogo: { titulo: string; fonte: FonteCatalogo };
  Elenco: { titulo: string; elenco: MembroElenco[] };
};

export type PropsPilha<Tela extends keyof PilhaParams> = NativeStackScreenProps<PilhaParams, Tela>;

export type PropsAba<Tela extends keyof AbasParams> = CompositeScreenProps<
  BottomTabScreenProps<AbasParams, Tela>,
  NativeStackScreenProps<PilhaParams>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends PilhaParams {}
  }
}
