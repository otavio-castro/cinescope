import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '../componentes/Botao';
import { Logo } from '../componentes/Logo';
import { Texto } from '../componentes/Texto';
import { useAuth } from '../contextos/AuthContext';
import { mensagemDeErro } from '../hooks/useRequisicao';
import { cores } from '../tema';

type Acao = 'conta' | 'visitante';

const LARGURA_PROTOTIPO = 390;

const POSTERES = [
  require('../../assets/entrada/poster-01.jpg'),
  require('../../assets/entrada/poster-02.jpg'),
  require('../../assets/entrada/poster-03.jpg'),
  require('../../assets/entrada/poster-04.jpg'),
  require('../../assets/entrada/poster-05.jpg'),
  require('../../assets/entrada/poster-06.jpg'),
  require('../../assets/entrada/poster-07.jpg'),
  require('../../assets/entrada/poster-08.jpg'),
  require('../../assets/entrada/poster-09.jpg'),
  require('../../assets/entrada/poster-10.jpg'),
  require('../../assets/entrada/poster-11.jpg'),
  require('../../assets/entrada/poster-12.jpg'),
];

export function EntradaTela() {
  const { entrarComConta, entrarComoVisitante } = useAuth();
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const [acao, setAcao] = useState<Acao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const escala = width / LARGURA_PROTOTIPO;

  const entrar = async (escolha: Acao) => {
    setAcao(escolha);
    setErro(null);
    try {
      await (escolha === 'conta' ? entrarComConta() : entrarComoVisitante());
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setAcao(null);
    }
  };

  return (
    <View style={estilos.tela}>
      <View style={StyleSheet.absoluteFill}>
        {POSTERES.map((imagem, indice) => (
          <Image
            key={indice}
            source={imagem}
            style={{
              position: 'absolute',
              left: (-30 + (indice % 4) * 118) * escala,
              top: (-40 + Math.floor(indice / 4) * 173) * escala,
              width: 110 * escala,
              height: 165 * escala,
              borderRadius: 12,
            }}
          />
        ))}
      </View>
      <LinearGradient
        colors={[
          'rgba(13,15,20,0.55)',
          'rgba(13,15,20,0.30)',
          'rgba(13,15,20,0.88)',
          cores.fundo,
          cores.fundo,
        ]}
        locations={[0, 0.25, 0.5, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={[estilos.conteudo, { paddingBottom: bottom + 14 }]} bounces={false}>
        <Logo tamanho={56} />
        <Texto negrito tamanho={40} style={estilos.titulo}>
          CineScope
        </Texto>
        <Texto tamanho={17} cor={cores.textoMedio} style={estilos.descricao}>
          Descubra filmes e séries, acompanhe{'\n'}lançamentos e monte a sua lista.
        </Texto>
        {erro && (
          <Texto tamanho={13} cor={cores.perigo} style={estilos.erro} accessibilityLiveRegion="polite">
            {erro}
          </Texto>
        )}
        <Botao
          rotulo="Entrar com conta TMDB"
          altura={54}
          raio={14}
          tamanhoTexto={16}
          carregando={acao === 'conta'}
          desabilitado={acao !== null}
          onPress={() => entrar('conta')}
          style={estilos.entrar}
        />
        <Botao
          rotulo="Continuar como visitante"
          variante="translucido"
          altura={54}
          raio={14}
          tamanhoTexto={16}
          carregando={acao === 'visitante'}
          desabilitado={acao !== null}
          onPress={() => entrar('visitante')}
          style={estilos.visitante}
        />
        <Texto tamanho={12} cor={cores.textoLegal} style={estilos.aviso}>
          Dados e imagens fornecidos pela API do TMDB
        </Texto>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 220,
  },
  titulo: {
    marginTop: 14,
    marginLeft: -2,
    lineHeight: 48,
  },
  descricao: {
    marginTop: 7,
    lineHeight: 24,
  },
  erro: {
    marginTop: 12,
    lineHeight: 18,
  },
  entrar: {
    marginTop: 24,
  },
  visitante: {
    marginTop: 12,
  },
  aviso: {
    marginTop: 14,
    textAlign: 'center',
  },
});
