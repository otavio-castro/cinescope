import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartaoSugestao } from '../componentes/CartaoSugestao';
import { Carregando, MensagemVazia } from '../componentes/EstadoTela';
import { COLUNAS_GRADE, ESPACO_GRADE, GradePoster } from '../componentes/GradePoster';
import { Texto } from '../componentes/Texto';
import { useAuth } from '../contextos/AuthContext';
import { useLista } from '../contextos/ListaContext';
import { mensagemDeErro } from '../hooks/useRequisicao';
import type { PropsAba } from '../navegacao/tipos';
import { alturaBarraAbas, cores, margem } from '../tema';
import type { ItemLista, TipoTitulo } from '../tipos';

export function MinhaListaTela({ navigation }: PropsAba<'MinhaLista'>) {
  const { conectado } = useAuth();
  const { itens, carregando, sincronizando, sincronizar, remover, alternarAssistido } = useLista();
  const { top, bottom } = useSafeAreaInsets();
  const [tipo, setTipo] = useState<TipoTitulo>('movie');
  const [editando, setEditando] = useState(false);

  const filmes = useMemo(() => itens.filter((item) => item.tipo === 'movie'), [itens]);
  const series = useMemo(() => itens.filter((item) => item.tipo === 'tv'), [itens]);
  const visiveis = tipo === 'movie' ? filmes : series;
  const emEdicao = editando && visiveis.length > 0;

  const atualizar = () => {
    sincronizar().catch((erro) => Alert.alert('Não foi possível sincronizar', mensagemDeErro(erro)));
  };

  const pressionar = (item: ItemLista) => {
    if (emEdicao) {
      alternarAssistido(item.tipo, item.id);
      return;
    }
    navigation.navigate('Detalhe', { tipo: item.tipo, id: item.id });
  };

  return (
    <View style={[estilos.tela, { paddingTop: top + 17 }]}>
      <View style={estilos.cabecalho}>
        <Texto negrito tamanho={28} style={estilos.titulo}>
          Minha Lista
        </Texto>
        {visiveis.length > 0 && (
          <Pressable accessibilityRole="button" hitSlop={12} onPress={() => setEditando(!editando)}>
            <Texto negrito tamanho={15} cor={cores.primaria}>
              {emEdicao ? 'Concluir' : 'Editar'}
            </Texto>
          </Pressable>
        )}
      </View>

      <View style={estilos.segmentos}>
        <Segmento rotulo={`Filmes · ${filmes.length}`} ativo={tipo === 'movie'} onPress={() => setTipo('movie')} />
        <Segmento rotulo={`Séries · ${series.length}`} ativo={tipo === 'tv'} onPress={() => setTipo('tv')} />
      </View>

      {carregando ? (
        <Carregando />
      ) : (
        <FlatList
          data={visiveis}
          numColumns={COLUNAS_GRADE}
          keyExtractor={(item) => `${item.tipo}-${item.id}`}
          columnWrapperStyle={estilos.linha}
          contentContainerStyle={[estilos.grade, { paddingBottom: alturaBarraAbas + bottom + 24 }]}
          refreshControl={
            conectado ? (
              <RefreshControl
                refreshing={sincronizando}
                onRefresh={atualizar}
                tintColor={cores.primaria}
                colors={[cores.primaria]}
                progressBackgroundColor={cores.superficie}
              />
            ) : undefined
          }
          ListHeaderComponent={
            emEdicao ? (
              <Texto tamanho={12} cor={cores.textoMedio}>
                Toque no pôster para marcar como assistido ou no X para remover.
              </Texto>
            ) : undefined
          }
          renderItem={({ item }) => (
            <GradePoster
              titulo={item.titulo}
              ano={item.ano}
              nota={item.nota}
              posterPath={item.posterPath}
              assistido={item.assistido}
              editando={emEdicao}
              onPress={() => pressionar(item)}
              onRemover={() => remover(item.tipo, item.id)}
            />
          )}
          ListEmptyComponent={
            <MensagemVazia
              titulo={tipo === 'movie' ? 'Nenhum filme salvo' : 'Nenhuma série salva'}
              descricao="Toque no marcador de um título para guardá-lo aqui."
            />
          }
          ListFooterComponent={
            visiveis.length > 0 ? (
              <CartaoSugestao
                base={visiveis[0]}
                onVerSugestoes={() =>
                  navigation.navigate('Catalogo', {
                    titulo: `Porque você salvou ${visiveis[0].titulo}`,
                    fonte: { tipo: 'recomendacoes', midia: visiveis[0].tipo, tituloId: visiveis[0].id },
                  })
                }
              />
            ) : undefined
          }
        />
      )}
    </View>
  );
}

interface SegmentoProps {
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
}

function Segmento({ rotulo, ativo, onPress }: SegmentoProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[estilos.segmento, ativo && estilos.segmentoAtivo]}
    >
      <Texto negrito={ativo} cor={ativo ? cores.texto : cores.textoMedio}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: margem,
  },
  titulo: {
    lineHeight: 34,
  },
  segmentos: {
    height: 40,
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: margem,
    padding: 4,
    borderRadius: 12,
    backgroundColor: cores.superficie,
  },
  segmento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  segmentoAtivo: {
    backgroundColor: cores.superficieAtiva,
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
});
