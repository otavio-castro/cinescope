import { useState } from 'react';
import { StyleSheet, View, type TextLayoutEvent } from 'react-native';

import { cores } from '../tema';
import { Texto } from './Texto';

const MAXIMO_LINHAS = 3;
const ESPACO_LER_MAIS = 12;

function resumir(linhas: string[]): string {
  const inicio = linhas.slice(0, MAXIMO_LINHAS - 1).join('');
  const ultima = linhas[MAXIMO_LINHAS - 1].trimEnd();
  const limite = Math.max(...linhas.slice(0, MAXIMO_LINHAS).map((linha) => linha.length)) - ESPACO_LER_MAIS;
  const corte = ultima.length > limite ? ultima.slice(0, limite).replace(/\s+\S*$/, '') : ultima;
  return `${inicio}${corte}…`;
}

export function Sinopse({ texto }: { texto: string }) {
  const [resumo, setResumo] = useState<string | null>(null);
  const [expandida, setExpandida] = useState(false);

  const medir = ({ nativeEvent }: TextLayoutEvent) => {
    const linhas = nativeEvent.lines.map((linha) => linha.text);
    setResumo(linhas.length > MAXIMO_LINHAS ? resumir(linhas) : null);
  };

  return (
    <View>
      <Texto style={[estilos.texto, estilos.medida]} cor={cores.textoCorpo} onTextLayout={medir} aria-hidden>
        {texto}
      </Texto>
      <Texto style={estilos.texto} cor={cores.textoCorpo}>
        {expandida || !resumo ? texto : resumo}
        {resumo && (
          <Texto negrito cor={cores.primaria} onPress={() => setExpandida(!expandida)}>
            {expandida ? '  Ler menos' : '  Ler mais'}
          </Texto>
        )}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  texto: {
    lineHeight: 21,
  },
  medida: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
  },
});
