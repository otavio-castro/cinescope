import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { cores, margem } from '../tema';
import type { Titulo } from '../tipos';
import { CartaoPoster, LARGURA_CARTAO } from './CartaoPoster';
import { Texto } from './Texto';

interface SecaoHorizontalProps {
  titulo: string;
  itens: Titulo[];
  onVerTudo: () => void;
  onAbrir: (titulo: Titulo) => void;
}

const ESPACO = 8;

export function SecaoHorizontal({ titulo, itens, onVerTudo, onAbrir }: SecaoHorizontalProps) {
  return (
    <View>
      <View style={estilos.cabecalho}>
        <Texto negrito tamanho={18}>
          {titulo}
        </Texto>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver tudo de ${titulo}`} hitSlop={10} onPress={onVerTudo}>
          <Texto negrito tamanho={13} cor={cores.primaria}>
            Ver tudo
          </Texto>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={itens}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        renderItem={({ item }) => <CartaoPoster titulo={item} onPress={() => onAbrir(item)} />}
        getItemLayout={(_, indice) => ({
          length: LARGURA_CARTAO + ESPACO,
          offset: margem + (LARGURA_CARTAO + ESPACO) * indice,
          index: indice,
        })}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    height: 22,
    marginBottom: 10,
    paddingHorizontal: margem,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lista: {
    paddingHorizontal: margem,
    gap: ESPACO,
  },
});
