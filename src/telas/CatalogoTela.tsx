import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CabecalhoVoltar } from '../componentes/CabecalhoVoltar';
import { Carregando, MensagemErro, MensagemVazia } from '../componentes/EstadoTela';
import { COLUNAS_GRADE, ESPACO_GRADE, GradePoster } from '../componentes/GradePoster';
import { useCatalogo } from '../hooks/useCatalogo';
import type { PropsPilha } from '../navegacao/tipos';
import { cores, margem } from '../tema';

export function CatalogoTela({ navigation, route }: PropsPilha<'Catalogo'>) {
  const { titulo, fonte } = route.params;
  const { itens, carregando, erro, carregarMais } = useCatalogo(fonte);
  const { top, bottom } = useSafeAreaInsets();

  const rodape = () => {
    if (erro) {
      return <MensagemErro mensagem={erro} onTentarNovamente={carregarMais} />;
    }
    if (!carregando) {
      return undefined;
    }
    return itens.length > 0 ? <ActivityIndicator color={cores.primaria} style={estilos.rodape} /> : <Carregando />;
  };

  return (
    <View style={[estilos.tela, { paddingTop: top + 7 }]}>
      <CabecalhoVoltar titulo={titulo} onVoltar={navigation.goBack} />
      <FlatList
        data={itens}
        numColumns={COLUNAS_GRADE}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        columnWrapperStyle={estilos.linha}
        contentContainerStyle={[estilos.grade, { paddingBottom: bottom + 24 }]}
        onEndReached={() => {
          if (!erro) {
            carregarMais();
          }
        }}
        onEndReachedThreshold={0.6}
        renderItem={({ item }) => (
          <GradePoster
            titulo={item.titulo}
            ano={item.ano}
            nota={item.nota}
            posterPath={item.posterPath}
            onPress={() => navigation.push('Detalhe', { tipo: item.tipo, id: item.id })}
          />
        )}
        ListEmptyComponent={
          !carregando && !erro ? (
            <MensagemVazia titulo="Nada por aqui" descricao="O TMDB não tem títulos para esta seleção." />
          ) : undefined
        }
        ListFooterComponent={rodape()}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  grade: {
    flexGrow: 1,
    paddingTop: 16,
    paddingHorizontal: margem,
    gap: 10,
  },
  linha: {
    gap: ESPACO_GRADE,
  },
  rodape: {
    marginVertical: 16,
  },
});
