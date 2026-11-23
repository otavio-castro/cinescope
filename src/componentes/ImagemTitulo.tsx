import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { urlImagem } from '../servicos/tmdbService';
import { cores } from '../tema';
import { Icone } from './Icone';

interface ImagemTituloProps {
  caminho: string | null;
  tamanho?: 'w342' | 'w500' | 'w780';
  style?: StyleProp<ImageStyle & ViewStyle>;
}

export function ImagemTitulo({ caminho, tamanho = 'w342', style }: ImagemTituloProps) {
  const [falhou, setFalhou] = useState(false);
  const url = urlImagem(caminho, tamanho);

  useEffect(() => setFalhou(false), [url]);

  if (!url || falhou) {
    return (
      <View style={[estilos.vazia, style]}>
        <Icone nome="reproduzir" tamanho={22} cor={cores.textoFraco} />
      </View>
    );
  }
  return (
    <Image source={{ uri: url }} style={[estilos.imagem, style]} resizeMode="cover" onError={() => setFalhou(true)} />
  );
}

const estilos = StyleSheet.create({
  imagem: {
    backgroundColor: cores.superficie,
  },
  vazia: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficie,
  },
});
