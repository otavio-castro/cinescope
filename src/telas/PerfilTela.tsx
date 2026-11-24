import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '../componentes/Botao';
import { Chip } from '../componentes/Chip';
import { FundoGradiente } from '../componentes/FundoGradiente';
import { Icone, type NomeIcone } from '../componentes/Icone';
import { Texto } from '../componentes/Texto';
import { useAuth } from '../contextos/AuthContext';
import { usePerfil } from '../hooks/usePerfil';
import { alturaBarraAbas, cores, margem } from '../tema';
import { obterIniciais } from '../utils/formatadores';

const ATRIBUICAO = 'Este produto usa a API do TMDB, mas não é endossado\nou certificado pelo TMDB.';

export function PerfilTela() {
  const { sessao, conectado, sair } = useAuth();
  const perfil = usePerfil();
  const { top, bottom } = useSafeAreaInsets();
  const rolagem = useRef<ScrollViewInstance>(null);
  const { recarregar } = perfil;

  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const nome = sessao?.conta?.nome ?? 'Visitante';
  const legenda = sessao?.conta
    ? `@${sessao.conta.usuario} · membro desde ${sessao.membroDesde}`
    : 'Sua lista fica salva neste aparelho';

  const confirmarSaida = () => {
    Alert.alert('Sair da conta', 'Você voltará para a tela de entrada.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  };

  const abrirConta = () => {
    if (conectado) {
      Alert.alert('Conta TMDB', 'Sua lista está sincronizada com a conta TMDB.');
      return;
    }
    Alert.alert('Conta TMDB', 'Entre com a conta TMDB para avaliar títulos e sincronizar a lista.', [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Entrar', onPress: sair },
    ]);
  };

  return (
    <View style={estilos.tela}>
      <ScrollView
        ref={rolagem}
        contentContainerStyle={{
          paddingTop: top + 17,
          paddingHorizontal: margem,
          paddingBottom: alturaBarraAbas + bottom + 20,
        }}
      >
        <View style={estilos.cabecalho}>
          <Texto negrito tamanho={28} style={estilos.titulo}>
            Perfil
          </Texto>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Configurações"
            hitSlop={12}
            onPress={() => rolagem.current?.scrollToEnd()}
          >
            <Icone nome="config" />
          </Pressable>
        </View>

        <View style={estilos.identificacao}>
          <FundoGradiente style={estilos.avatar}>
            <Texto negrito tamanho={24} cor={cores.fundo}>
              {obterIniciais(nome)}
            </Texto>
          </FundoGradiente>
          <View style={estilos.nomes}>
            <Texto negrito tamanho={20} numberOfLines={1}>
              {nome}
            </Texto>
            <Texto tamanho={13} cor={cores.textoMedio} numberOfLines={1}>
              {legenda}
            </Texto>
          </View>
        </View>

        <View style={estilos.totais}>
          <Total valor={perfil.assistidos} rotulo="Assistidos" />
          <Total valor={perfil.naLista} rotulo="Na lista" />
          <Total valor={perfil.avaliacoes} rotulo="Avaliações" />
        </View>

        <Texto negrito tamanho={16} style={estilos.secao}>
          Gêneros favoritos
        </Texto>
        <View style={estilos.generos}>
          {perfil.generosFavoritos.map((genero, indice) => (
            <Chip key={genero} rotulo={genero} ativo={indice === 0} altura={32} />
          ))}
          {perfil.generosFavoritos.length === 0 && perfil.carregando && (
            <ActivityIndicator color={cores.primaria} />
          )}
          {perfil.generosFavoritos.length === 0 && !perfil.carregando && !perfil.erro && (
            <Texto tamanho={13} cor={cores.textoFraco}>
              Salve títulos na Minha Lista para ver seus gêneros aqui.
            </Texto>
          )}
        </View>
        {perfil.erro && (
          <View style={estilos.erro}>
            <Texto tamanho={13} cor={cores.textoMedio}>
              {perfil.erro}
            </Texto>
            <Botao rotulo="Tentar novamente" variante="translucido" altura={40} onPress={perfil.recarregar} />
          </View>
        )}

        <View style={estilos.configuracoes}>
          <Opcao
            icone="link"
            rotulo="Conta TMDB"
            valor={conectado ? 'Conectada' : 'Visitante'}
            destaque={conectado}
            onPress={abrirConta}
          />
          <Opcao
            icone="sino"
            rotulo="Notificações"
            valor={perfil.notificacoes ? 'Lançamentos' : 'Desativadas'}
            onPress={perfil.alternarNotificacoes}
          />
          <Opcao
            icone="globo"
            rotulo="Idioma e região"
            valor="pt-BR"
            onPress={() => Alert.alert('Idioma e região', 'Os dados do TMDB são exibidos em português do Brasil.')}
          />
          <Opcao
            icone="info"
            rotulo="Sobre o app"
            valor="v1.0"
            ultima
            onPress={() => Alert.alert('CineScope v1.0', ATRIBUICAO.replace('\n', ' '))}
          />
        </View>

        <Pressable accessibilityRole="button" onPress={confirmarSaida} style={estilos.sair} hitSlop={8}>
          <Texto negrito tamanho={15} cor={cores.perigo}>
            Sair da conta
          </Texto>
        </Pressable>
        <Texto tamanho={10} cor={cores.textoLegal} style={estilos.atribuicao}>
          {ATRIBUICAO}
        </Texto>
      </ScrollView>
    </View>
  );
}

function Total({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <View style={estilos.total}>
      <Texto negrito tamanho={24}>
        {valor}
      </Texto>
      <Texto tamanho={12} cor={cores.textoFraco}>
        {rotulo}
      </Texto>
    </View>
  );
}

interface OpcaoProps {
  icone: NomeIcone;
  rotulo: string;
  valor: string;
  destaque?: boolean;
  ultima?: boolean;
  onPress: () => void;
}

function Opcao({ icone, rotulo, valor, destaque = false, ultima = false, onPress }: OpcaoProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${rotulo}: ${valor}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.opcao, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={estilos.iconeOpcao}>
        <Icone nome={icone} tamanho={18} cor={cores.primaria} espessura={1.8} />
      </View>
      <View style={[estilos.textoOpcao, !ultima && estilos.divisorOpcao]}>
        <Texto tamanho={15} style={estilos.rotuloOpcao}>
          {rotulo}
        </Texto>
        <Texto tamanho={13} negrito={destaque} cor={destaque ? cores.secundaria : cores.textoFraco}>
          {valor}
        </Texto>
        <Icone nome="avancar" tamanho={20} cor={cores.textoFraco} />
      </View>
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
  },
  titulo: {
    lineHeight: 34,
  },
  identificacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomes: {
    flex: 1,
    gap: 5,
  },
  totais: {
    flexDirection: 'row',
    gap: 13,
    marginTop: 20,
  },
  total: {
    flex: 1,
    height: 76,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 5,
    backgroundColor: cores.superficie,
  },
  secao: {
    marginTop: 22,
  },
  generos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },
  erro: {
    gap: 10,
    marginTop: 12,
  },
  configuracoes: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: cores.superficie,
  },
  opcao: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    gap: 12,
  },
  iconeOpcao: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(1,180,228,0.14)',
  },
  textoOpcao: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  divisorOpcao: {
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rotuloOpcao: {
    flex: 1,
  },
  sair: {
    alignSelf: 'flex-start',
    marginTop: 19,
  },
  atribuicao: {
    marginTop: 15,
    lineHeight: 14,
  },
});
