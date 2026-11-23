import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { cores } from '../tema';
import { Botao } from './Botao';
import { Texto } from './Texto';

export function Carregando() {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={cores.primaria} accessibilityLabel="Carregando" />
    </View>
  );
}

interface MensagemErroProps {
  mensagem: string;
  onTentarNovamente: () => void;
}

export function MensagemErro({ mensagem, onTentarNovamente }: MensagemErroProps) {
  return (
    <View style={estilos.centro}>
      <Texto negrito tamanho={18} style={estilos.texto}>
        Não deu para carregar
      </Texto>
      <Texto cor={cores.textoMedio} style={estilos.texto}>
        {mensagem}
      </Texto>
      <Botao rotulo="Tentar novamente" onPress={onTentarNovamente} style={estilos.botao} />
    </View>
  );
}

export function MensagemVazia({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <View style={estilos.centro}>
      <Texto negrito tamanho={18} style={estilos.texto}>
        {titulo}
      </Texto>
      <Texto cor={cores.textoMedio} style={estilos.texto}>
        {descricao}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  texto: {
    textAlign: 'center',
    lineHeight: 21,
  },
  botao: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
});
