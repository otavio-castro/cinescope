import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '../componentes/Chip';
import { Carregando, MensagemErro, MensagemVazia } from '../componentes/EstadoTela';
import { Icone } from '../componentes/Icone';
import { ItemPessoa, ItemTitulo } from '../componentes/ItemResultado';
import { Texto } from '../componentes/Texto';
import { useLista } from '../contextos/ListaContext';
import { useBusca, type FiltroBusca } from '../hooks/useBusca';
import type { PropsAba } from '../navegacao/tipos';
import { alturaBarraAbas, cores, fontes, margem } from '../tema';
import type { ResultadoBusca } from '../tipos';

const FILTROS: { valor: FiltroBusca; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Tudo' },
  { valor: 'movie', rotulo: 'Filmes' },
  { valor: 'tv', rotulo: 'Séries' },
  { valor: 'person', rotulo: 'Pessoas' },
];

export function BuscarTela({ navigation }: PropsAba<'Buscar'>) {
  const busca = useBusca();
  const { estaSalvo, alternar } = useLista();
  const { top, bottom } = useSafeAreaInsets();
  const [focado, setFocado] = useState(false);

  const renderizarItem = ({ item }: { item: ResultadoBusca }) => {
    if (item.tipo === 'person') {
      return (
        <ItemPessoa
          pessoa={item}
          onAbrir={() =>
            navigation.navigate('Catalogo', { titulo: item.nome, fonte: { tipo: 'pessoa', pessoaId: item.id } })
          }
        />
      );
    }
    return (
      <ItemTitulo
        titulo={item}
        generos={item.generoIds.map((id) => busca.generos?.get(id) ?? '').filter(Boolean)}
        salvo={estaSalvo(item.tipo, item.id)}
        onAbrir={() => navigation.navigate('Detalhe', { tipo: item.tipo, id: item.id })}
        onAlternar={() => alternar(item)}
      />
    );
  };

  return (
    <View style={[estilos.tela, { paddingTop: top + 17 }]}>
      <Texto negrito tamanho={28} style={estilos.titulo}>
        Buscar
      </Texto>

      <View style={[estilos.campo, (focado || busca.texto !== '') && estilos.campoAtivo]}>
        <Icone nome="buscar" cor={cores.textoMedio} />
        <TextInput
          accessibilityLabel="Buscar filmes, séries e pessoas"
          placeholder="Filmes, séries e pessoas"
          placeholderTextColor={cores.textoFraco}
          selectionColor={cores.primaria}
          cursorColor={cores.primaria}
          value={busca.texto}
          onChangeText={busca.setTexto}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          autoCorrect={false}
          returnKeyType="search"
          style={estilos.entrada}
        />
        {busca.texto !== '' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            hitSlop={12}
            onPress={() => busca.setTexto('')}
            style={estilos.limpar}
          >
            <Icone nome="fechar" tamanho={16.8} espessura={1.6} />
          </Pressable>
        )}
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.filtros}
        >
          {FILTROS.map(({ valor, rotulo }) => (
            <Chip
              key={valor}
              rotulo={rotulo}
              ativo={busca.filtro === valor}
              onPress={() => busca.setFiltro(valor)}
            />
          ))}
        </ScrollView>
      </View>

      {busca.consulta === '' && (
        <MensagemVazia
          titulo="O que você quer assistir?"
          descricao="Pesquise pelo nome de um filme, série ou pessoa."
        />
      )}
      {busca.carregando && <Carregando />}
      {busca.erro && <MensagemErro mensagem={busca.erro} onTentarNovamente={busca.recarregar} />}
      {busca.generos && (
        <FlatList
          data={busca.resultados}
          keyExtractor={(item) => `${item.tipo}-${item.id}`}
          renderItem={renderizarItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[estilos.lista, { paddingBottom: alturaBarraAbas + bottom + 20 }]}
          ListHeaderComponent={
            <Texto tamanho={13} cor={cores.textoFraco} style={estilos.contagem}>
              {busca.resultados.length} {busca.resultados.length === 1 ? 'resultado' : 'resultados'} para “
              {busca.consulta}”
            </Texto>
          }
          ListEmptyComponent={
            <MensagemVazia titulo="Nenhum resultado" descricao="Tente outro nome ou mude o filtro." />
          }
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  titulo: {
    lineHeight: 34,
    marginHorizontal: margem,
  },
  campo: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    marginHorizontal: margem,
    paddingLeft: 13,
    paddingRight: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: cores.bordaChip,
    backgroundColor: cores.superficie,
  },
  campoAtivo: {
    borderColor: cores.primaria,
  },
  entrada: {
    flex: 1,
    height: 45,
    paddingVertical: 0,
    fontSize: 16,
    fontFamily: fontes.regular,
    color: cores.texto,
  },
  limpar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.botaoLimpar,
  },
  filtros: {
    gap: 8,
    marginTop: 14,
    paddingHorizontal: margem,
  },
  lista: {
    flexGrow: 1,
    paddingHorizontal: margem,
    paddingTop: 17,
  },
  contagem: {
    marginBottom: 28,
  },
});
