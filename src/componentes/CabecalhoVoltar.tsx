import { Pressable, StyleSheet, View } from 'react-native';

import { cores, margem } from '../tema';
import { Icone } from './Icone';
import { Texto } from './Texto';

export function CabecalhoVoltar({ titulo, onVoltar }: { titulo: string; onVoltar: () => void }) {
  return (
    <View style={estilos.cabecalho}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onVoltar} style={estilos.botao}>
        <Icone nome="voltar" espessura={2.2} />
      </Pressable>
      <Texto negrito tamanho={22} numberOfLines={2} style={estilos.titulo}>
        {titulo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: margem,
  },
  botao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficie,
  },
  titulo: {
    flex: 1,
    lineHeight: 27,
  },
});
