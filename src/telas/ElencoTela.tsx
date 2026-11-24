import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarElenco } from '../componentes/AvatarElenco';
import { CabecalhoVoltar } from '../componentes/CabecalhoVoltar';
import { Icone } from '../componentes/Icone';
import { Texto } from '../componentes/Texto';
import type { PropsPilha } from '../navegacao/tipos';
import { cores, margem } from '../tema';

export function ElencoTela({ navigation, route }: PropsPilha<'Elenco'>) {
  const { titulo, elenco } = route.params;
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View style={[estilos.tela, { paddingTop: top + 7 }]}>
      <CabecalhoVoltar titulo={`Elenco de ${titulo}`} onVoltar={navigation.goBack} />
      <FlatList
        data={elenco}
        keyExtractor={(membro, indice) => `${membro.id}-${indice}`}
        contentContainerStyle={[estilos.lista, { paddingBottom: bottom + 24 }]}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.push('Catalogo', { titulo: item.nome, fonte: { tipo: 'pessoa', pessoaId: item.id } })
            }
            style={({ pressed }) => [estilos.item, { opacity: pressed ? 0.75 : 1 }]}
          >
            <AvatarElenco nome={item.nome} indice={index} />
            <View style={estilos.textos}>
              <Texto negrito tamanho={16} numberOfLines={1}>
                {item.nome}
              </Texto>
              <Texto tamanho={13} cor={cores.textoMedio} numberOfLines={1}>
                {item.personagem}
              </Texto>
            </View>
            <Icone nome="avancar" cor={cores.textoFraco} />
          </Pressable>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  lista: {
    paddingTop: 12,
    paddingHorizontal: margem,
  },
  item: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.divisor,
  },
  textos: {
    flex: 1,
    gap: 5,
  },
});
