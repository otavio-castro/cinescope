import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AbasParams } from '../navegacao/tipos';
import { alturaBarraAbas, cores } from '../tema';
import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

const ABAS: Record<keyof AbasParams, { rotulo: string; icone: NomeIcone }> = {
  Inicio: { rotulo: 'Início', icone: 'inicio' },
  Buscar: { rotulo: 'Buscar', icone: 'buscar' },
  MinhaLista: { rotulo: 'Minha Lista', icone: 'marcador' },
  Perfil: { rotulo: 'Perfil', icone: 'perfil' },
};

export function BarraAbas({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[estilos.barra, { height: alturaBarraAbas + bottom + 1, paddingBottom: bottom }]}>
      {state.routes.map((rota, indice) => {
        const ativa = state.index === indice;
        const { rotulo, icone } = ABAS[rota.name as keyof AbasParams];
        const cor = ativa ? cores.primaria : cores.textoFraco;

        const selecionar = () => {
          const evento = navigation.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
          if (!ativa && !evento.defaultPrevented) {
            navigation.navigate(rota.name);
          }
        };

        return (
          <Pressable
            key={rota.key}
            accessibilityRole="tab"
            accessibilityLabel={rotulo}
            accessibilityState={{ selected: ativa }}
            onPress={selecionar}
            style={estilos.aba}
          >
            <Icone
              nome={icone}
              cor={cor}
              preenchimento={ativa && icone === 'marcador' ? cor : 'none'}
            />
            <Texto negrito tamanho={11} cor={cor}>
              {rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: cores.barra,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 11,
    gap: 5,
  },
});
