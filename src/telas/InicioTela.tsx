import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '../componentes/Botao';
import { Carregando, MensagemErro, MensagemVazia } from '../componentes/EstadoTela';
import { Icone } from '../componentes/Icone';
import { ImagemTitulo } from '../componentes/ImagemTitulo';
import { Logo } from '../componentes/Logo';
import { ModalCategorias } from '../componentes/ModalCategorias';
import { Nota } from '../componentes/Nota';
import { SecaoHorizontal } from '../componentes/SecaoHorizontal';
import { Texto } from '../componentes/Texto';
import { useLista } from '../contextos/ListaContext';
import { useInicio } from '../hooks/useInicio';
import { useTrailer } from '../hooks/useTrailer';
import type { PropsAba } from '../navegacao/tipos';
import { alturaBarraAbas, cores, margem } from '../tema';
import type { Titulo } from '../tipos';
import { unirComPonto } from '../utils/formatadores';

const PROPORCAO_DESTAQUE = 440 / 390;

export function InicioTela({ navigation }: PropsAba<'Inicio'>) {
  const inicio = useInicio();
  const { estaSalvo, alternar } = useLista();
  const { abrirTrailer, abrindo } = useTrailer();
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [categoriasVisiveis, setCategoriasVisiveis] = useState(false);

  const { dados, carregando, erro, recarregar, filtro, genero } = inicio;
  const destaque = dados?.destaque ?? null;
  const salvo = destaque ? estaSalvo(destaque.tipo, destaque.id) : false;

  const abrirDetalhe = (titulo: Titulo) => navigation.navigate('Detalhe', { tipo: titulo.tipo, id: titulo.id });

  const resumo = dados?.detalhe
    ? unirComPonto([
        dados.detalhe.ano,
        dados.detalhe.duracao,
        dados.detalhe.generos
          .slice(0, 2)
          .map((item) => item.nome)
          .join(', '),
      ])
    : destaque?.ano;

  return (
    <View style={estilos.tela}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: alturaBarraAbas + bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={carregando && dados !== null}
            onRefresh={recarregar}
            tintColor={cores.primaria}
            colors={[cores.primaria]}
            progressBackgroundColor={cores.superficie}
            progressViewOffset={top}
          />
        }
      >
        <View style={[estilos.destaque, destaque && { minHeight: Math.max(width * PROPORCAO_DESTAQUE, 440) }]}>
          {destaque && (
            <ImagemTitulo
              caminho={destaque.backdropPath ?? destaque.posterPath}
              tamanho="w780"
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={[
              'rgba(13,15,20,0.80)',
              'rgba(13,15,20,0)',
              'rgba(13,15,20,0.15)',
              'rgba(13,15,20,0.85)',
              cores.fundo,
            ]}
            locations={[0, 0.24, 0.5, 0.78, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[estilos.cabecalho, { marginTop: top + 11 }]}>
            <Logo tamanho={28} />
            <Texto negrito tamanho={22} style={estilos.marca}>
              CineScope
            </Texto>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar"
              hitSlop={8}
              onPress={() => navigation.navigate('Buscar')}
            >
              <Icone nome="buscar" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lançamentos"
              hitSlop={8}
              onPress={() => navigation.navigate('Catalogo', { titulo: 'Lançamentos', fonte: { tipo: 'lancamentos' } })}
            >
              <Icone nome="sino" />
              <View style={estilos.ponto} />
            </Pressable>
          </View>

          <View style={estilos.filtros}>
            <FiltroInicio rotulo="Filmes" ativo={filtro === 'movie'} onPress={() => inicio.alternarFiltro('movie')} />
            <FiltroInicio rotulo="Séries" ativo={filtro === 'tv'} onPress={() => inicio.alternarFiltro('tv')} />
            <FiltroInicio
              rotulo={genero?.nome ?? 'Categorias'}
              ativo={genero !== null}
              comSeta
              onPress={() => setCategoriasVisiveis(true)}
            />
          </View>

          {destaque && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir ${destaque.titulo}`}
                style={estilos.informacoes}
                onPress={() => abrirDetalhe(destaque)}
              >
                <View style={estilos.selo}>
                  <Texto negrito tamanho={12} cor={cores.primariaClara}>
                    {dados?.selo}
                  </Texto>
                </View>
                <Texto negrito tamanho={32} numberOfLines={2} style={estilos.tituloDestaque}>
                  {destaque.titulo}
                </Texto>
                <View style={estilos.resumo}>
                  <Nota valor={destaque.nota} tamanhoIcone={14.4} />
                  <Texto tamanho={13} cor={cores.textoCorpo} numberOfLines={1} style={estilos.textoResumo}>
                    {resumo}
                  </Texto>
                </View>
              </Pressable>
              <View style={estilos.acoes}>
                <Botao
                  rotulo="Trailer"
                  variante="claro"
                  altura={46}
                  carregando={abrindo}
                  icone={<Icone nome="reproduzir" tamanho={16} cor={cores.fundo} />}
                  onPress={() => abrirTrailer(destaque.tipo, destaque.id)}
                  style={estilos.acao}
                />
                <Botao
                  rotulo="Minha Lista"
                  variante="translucidoForte"
                  altura={46}
                  icone={<Icone nome={salvo ? 'check' : 'mais'} />}
                  onPress={() => alternar(destaque)}
                  style={estilos.acao}
                />
              </View>
            </>
          )}
        </View>

        {carregando && !dados && <Carregando />}
        {erro && <MensagemErro mensagem={erro} onTentarNovamente={recarregar} />}
        {dados && !destaque && (
          <MensagemVazia titulo="Nada por aqui" descricao="Não há títulos para esta categoria no momento." />
        )}
        {destaque && (
          <View style={estilos.secoes}>
            {dados?.secoes.map((secao) => (
              <SecaoHorizontal
                key={secao.titulo}
                titulo={secao.titulo}
                itens={secao.itens}
                onAbrir={abrirDetalhe}
                onVerTudo={() => navigation.navigate('Catalogo', { titulo: secao.titulo, fonte: secao.fonte })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ModalCategorias
        visivel={categoriasVisiveis}
        midia={inicio.midiaCategorias}
        selecionado={genero}
        onSelecionar={inicio.escolherGenero}
        onFechar={() => setCategoriasVisiveis(false)}
      />
    </View>
  );
}

interface FiltroInicioProps {
  rotulo: string;
  ativo: boolean;
  comSeta?: boolean;
  onPress: () => void;
}

function FiltroInicio({ rotulo, ativo, comSeta = false, onPress }: FiltroInicioProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[estilos.filtro, ativo && estilos.filtroAtivo]}
    >
      <Texto negrito numberOfLines={1} cor={ativo ? cores.fundo : cores.texto}>
        {rotulo}
      </Texto>
      {comSeta && <Icone nome="abrir" tamanho={16} cor={ativo ? cores.fundo : cores.texto} espessura={1.8} />}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  destaque: {
    paddingBottom: 8,
    overflow: 'hidden',
  },
  cabecalho: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: margem,
    gap: 10,
  },
  marca: {
    flex: 1,
    marginLeft: -2,
  },
  ponto: {
    position: 'absolute',
    top: -2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: cores.fundo,
    backgroundColor: cores.primaria,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: margem,
  },
  filtro: {
    height: 32,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12.5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(13,15,20,0.55)',
  },
  filtroAtivo: {
    borderColor: cores.texto,
    backgroundColor: cores.texto,
  },
  informacoes: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: margem,
  },
  selo: {
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(1,180,228,0.22)',
  },
  tituloDestaque: {
    marginTop: 5,
    lineHeight: 39,
  },
  resumo: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  textoResumo: {
    flex: 1,
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingHorizontal: margem,
  },
  acao: {
    flex: 1,
  },
  secoes: {
    marginTop: 14,
    gap: 22,
  },
});
