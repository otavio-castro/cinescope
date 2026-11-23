import { Pressable, StyleSheet, View } from 'react-native';

import type { Titulo } from '../tipos';
import { ImagemTitulo } from './ImagemTitulo';
import { Nota } from './Nota';

interface CartaoPosterProps {
  titulo: Titulo;
  onPress: () => void;
}

export const LARGURA_CARTAO = 100;

export function CartaoPoster({ titulo, onPress }: CartaoPosterProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo.titulo}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <ImagemTitulo caminho={titulo.posterPath} style={estilos.poster} />
      <View style={estilos.selo}>
        <Nota valor={titulo.nota} tamanhoTexto={11} tamanhoIcone={10.8} />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  poster: {
    width: LARGURA_CARTAO,
    height: 150,
    borderRadius: 10,
  },
  selo: {
    position: 'absolute',
    top: 6,
    left: 6,
    minWidth: 44,
    height: 20,
    borderRadius: 6,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,15,20,0.78)',
  },
});
