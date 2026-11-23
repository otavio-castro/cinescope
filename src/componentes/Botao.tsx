import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cores } from '../tema';
import { FundoGradiente } from './FundoGradiente';
import { Texto } from './Texto';

interface BotaoProps {
  rotulo: string;
  onPress: () => void;
  variante?: 'gradiente' | 'claro' | 'translucido' | 'translucidoForte';
  icone?: ReactNode;
  altura?: number;
  raio?: number;
  tamanhoTexto?: number;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Botao({
  rotulo,
  onPress,
  variante = 'gradiente',
  icone,
  altura = 48,
  raio = 12,
  tamanhoTexto = 15,
  carregando = false,
  desabilitado = false,
  style,
}: BotaoProps) {
  const corTexto = variante === 'gradiente' || variante === 'claro' ? cores.fundo : cores.texto;
  const formato = [estilos.conteudo, { height: altura, borderRadius: raio }];
  const conteudo = carregando ? (
    <ActivityIndicator color={corTexto} />
  ) : (
    <>
      {icone}
      <Texto negrito tamanho={tamanhoTexto} cor={corTexto} numberOfLines={1}>
        {rotulo}
      </Texto>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      disabled={desabilitado || carregando}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed || desabilitado ? 0.7 : 1 }]}
    >
      {variante === 'gradiente' ? (
        <FundoGradiente style={formato}>{conteudo}</FundoGradiente>
      ) : (
        <View style={[formato, estilos[variante]]}>{conteudo}</View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  claro: {
    backgroundColor: cores.texto,
  },
  translucido: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  translucidoForte: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
});
