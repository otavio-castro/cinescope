import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarElenco } from '../componentes/AvatarElenco';
import { Botao } from '../componentes/Botao';
import { Carregando, MensagemErro } from '../componentes/EstadoTela';
import { Icone, type NomeIcone } from '../componentes/Icone';
import { ImagemTitulo } from '../componentes/ImagemTitulo';
import { ModalAvaliacao } from '../componentes/ModalAvaliacao';
import { Nota } from '../componentes/Nota';
import { Sinopse } from '../componentes/Sinopse';
import { Texto } from '../componentes/Texto';
import { useAuth } from '../contextos/AuthContext';
import { useLista } from '../contextos/ListaContext';
import { useDetalhe } from '../hooks/useDetalhe';
import { useTrailer } from '../hooks/useTrailer';
import type { PropsPilha } from '../navegacao/tipos';
import { cores, margem } from '../tema';
import { abreviarNome, formatarVotos, unirComPonto } from '../utils/formatadores';

const PROPORCAO_FUNDO = 300 / 390;
const MAXIMO_ELENCO = 15;

export function DetalheTela({ navigation, route }: PropsPilha<'Detalhe'>) {
  const { tipo, id } = route.params;
  const { dados, carregando, erro, recarregar, avaliar } = useDetalhe(tipo, id);
  const { conectado } = useAuth();
  const { estaSalvo, alternar, ehFavorito, alternarFavorito } = useLista();
  const { abrirTrailer, abrindo } = useTrailer();
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [avaliando, setAvaliando] = useState(false);
  const [minhaNota, setMinhaNota] = useState(0);

  const alturaFundo = Math.max(width * PROPORCAO_FUNDO, 280);
  const salvo = estaSalvo(tipo, id);
  const favorito = ehFavorito(tipo, id);

  const compartilhar = () => {
    if (dados) {
      Share.share({ message: `${dados.titulo}\nhttps://www.themoviedb.org/${tipo}/${id}` }).catch(() => undefined);
    }
  };

  const pedirAvaliacao = () => {
    if (conectado) {
      setAvaliando(true);
      return;
    }
    Alert.alert('Conta necessária', 'Entre com a conta TMDB pelo Perfil para avaliar títulos.');
  };

  const enviarAvaliacao = async (nota: number) => {
    await avaliar(nota);
    setMinhaNota(nota);
  };

  return (
    <View style={estilos.tela}>
      {carregando && !dados && <Carregando />}
      {erro && !dados && <MensagemErro mensagem={erro} onTentarNovamente={recarregar} />}
      {dados && (
        <ScrollView contentContainerStyle={{ paddingBottom: bottom + 24 }}>
          <View style={{ height: alturaFundo }}>
            <ImagemTitulo
              caminho={dados.backdropPath ?? dados.posterPath}
              tamanho="w780"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(13,15,20,0.70)', 'rgba(13,15,20,0)', 'rgba(13,15,20,0.45)', cores.fundo]}
              locations={[0, 0.3, 0.65, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={estilos.apresentacao}>
            <ImagemTitulo caminho={dados.posterPath} style={estilos.poster} />
            <View style={estilos.titulos}>
              <Texto negrito tamanho={22} numberOfLines={3} style={estilos.titulo}>
                {dados.titulo}
              </Texto>
              <Texto tamanho={13} cor={cores.textoMedio} numberOfLines={2} style={estilos.original}>
                {unirComPonto([dados.tituloOriginal, dados.ano])}
              </Texto>
              <View style={estilos.nota}>
                <Nota valor={dados.nota} tamanhoTexto={14} tamanhoIcone={14.4} />
                <Texto tamanho={13} cor={cores.textoMedio}>
                  /10 · {formatarVotos(dados.votos)}
                </Texto>
              </View>
            </View>
          </View>

          {dados.generos.length > 0 && (
            <View style={estilos.generos}>
              {dados.generos.map((genero) => (
                <View key={genero.id} style={estilos.genero}>
                  <Texto tamanho={12} cor={cores.textoChip}>
                    {genero.nome}
                  </Texto>
                </View>
              ))}
            </View>
          )}

          <View style={estilos.dados}>
            <Dado rotulo={dados.rotuloDuracao} valor={dados.duracao} />
            <Dado rotulo="Lançamento" valor={dados.lancamento} />
            <Dado rotulo="Classificação" valor={dados.classificacao} />
          </View>

          <View style={estilos.acoes}>
            <Botao
              rotulo="Assistir trailer"
              icone={<Icone nome="reproduzir" tamanho={16} cor={cores.fundo} />}
              carregando={abrindo}
              onPress={() => abrirTrailer(tipo, id, dados.trailerUrl)}
              style={estilos.trailer}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={salvo ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
              accessibilityState={{ selected: salvo }}
              onPress={() => alternar(dados)}
              style={[estilos.acao, salvo && estilos.acaoSalva]}
            >
              <Icone
                nome="marcador"
                tamanho={20.5}
                cor={salvo ? cores.primaria : cores.texto}
                preenchimento={salvo ? cores.primaria : 'none'}
                espessura={1.6}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Avaliar"
              onPress={pedirAvaliacao}
              style={estilos.acao}
            >
              <Icone
                nome="estrela"
                tamanho={19.2}
                cor={minhaNota > 0 ? cores.estrela : cores.texto}
                preenchimento={minhaNota > 0 ? cores.estrela : 'none'}
                espessura={1.7}
              />
            </Pressable>
          </View>

          <View style={estilos.sinopse}>
            <Texto negrito tamanho={16}>
              Sinopse
            </Texto>
            <Sinopse key={dados.sinopse} texto={dados.sinopse} />
          </View>

          {dados.elenco.length > 0 && (
            <>
              <View style={estilos.cabecalhoElenco}>
                <Texto negrito tamanho={16}>
                  Elenco principal
                </Texto>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => navigation.navigate('Elenco', { titulo: dados.titulo, elenco: dados.elenco })}
                >
                  <Texto negrito tamanho={13} cor={cores.primaria}>
                    Ver todos
                  </Texto>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={dados.elenco.slice(0, MAXIMO_ELENCO)}
                keyExtractor={(membro, indice) => `${membro.id}-${indice}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={estilos.elenco}
                renderItem={({ item, index }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.nome}, ${item.personagem}`}
                    onPress={() =>
                      navigation.push('Catalogo', { titulo: item.nome, fonte: { tipo: 'pessoa', pessoaId: item.id } })
                    }
                    style={estilos.membro}
                  >
                    <AvatarElenco nome={item.nome} indice={index} />
                    <Texto negrito tamanho={11} numberOfLines={1} style={estilos.nomeMembro}>
                      {abreviarNome(item.nome)}
                    </Texto>
                    <Texto tamanho={10} cor={cores.textoFraco} numberOfLines={1} style={estilos.personagem}>
                      {item.personagem}
                    </Texto>
                  </Pressable>
                )}
              />
            </>
          )}
        </ScrollView>
      )}

      <View style={[estilos.topo, { top: top + 7 }]} pointerEvents="box-none">
        <BotaoCircular icone="voltar" rotulo="Voltar" espessura={2.2} onPress={navigation.goBack} />
        {dados && (
          <View style={estilos.topoDireita}>
            <BotaoCircular icone="compartilhar" rotulo="Compartilhar" onPress={compartilhar} />
            <BotaoCircular
              icone="coracao"
              rotulo={favorito ? 'Remover dos favoritos' : 'Favoritar'}
              cor={favorito ? cores.perigo : cores.texto}
              preenchimento={favorito ? cores.perigo : 'none'}
              tamanho={22}
              espessura={1.8}
              onPress={() => alternarFavorito(tipo, id)}
            />
          </View>
        )}
      </View>

      {dados && avaliando && (
        <ModalAvaliacao
          visivel
          titulo={dados.titulo}
          notaAtual={minhaNota}
          onEnviar={enviarAvaliacao}
          onFechar={() => setAvaliando(false)}
        />
      )}
    </View>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado}>
      <Texto tamanho={11} cor={cores.textoFraco}>
        {rotulo}
      </Texto>
      <Texto negrito numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Texto>
    </View>
  );
}

interface BotaoCircularProps {
  icone: NomeIcone;
  rotulo: string;
  onPress: () => void;
  cor?: string;
  preenchimento?: string;
  tamanho?: number;
  espessura?: number;
}

function BotaoCircular({ icone, rotulo, onPress, cor, preenchimento, tamanho, espessura }: BotaoCircularProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotulo} onPress={onPress} style={estilos.circular}>
      <Icone nome={icone} cor={cor} preenchimento={preenchimento} tamanho={tamanho} espessura={espessura} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  topo: {
    position: 'absolute',
    left: margem,
    right: margem,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topoDireita: {
    flexDirection: 'row',
    gap: 8,
  },
  circular: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,15,20,0.55)',
  },
  apresentacao: {
    flexDirection: 'row',
    gap: 16,
    marginTop: -86,
    paddingHorizontal: margem,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
  },
  titulos: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  titulo: {
    lineHeight: 27,
  },
  original: {
    marginTop: 4,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7,
  },
  generos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 19,
    paddingHorizontal: margem,
  },
  genero: {
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.bordaForte,
  },
  dados: {
    flexDirection: 'row',
    gap: 13,
    marginTop: 16,
    paddingHorizontal: margem,
  },
  dado: {
    flex: 1,
    height: 58,
    gap: 7,
    paddingTop: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: cores.superficie,
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: margem,
  },
  trailer: {
    flex: 1,
    marginRight: 4,
  },
  acao: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  acaoSalva: {
    borderColor: 'rgba(1,180,228,0.50)',
    backgroundColor: 'rgba(1,180,228,0.16)',
  },
  sinopse: {
    gap: 5,
    marginTop: 18,
    paddingHorizontal: margem,
  },
  cabecalhoElenco: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
    marginBottom: 13,
    paddingHorizontal: margem,
  },
  elenco: {
    paddingHorizontal: margem - 12,
  },
  membro: {
    width: 76,
    alignItems: 'center',
  },
  nomeMembro: {
    marginTop: 9,
  },
  personagem: {
    marginTop: 3,
    maxWidth: 72,
  },
});
