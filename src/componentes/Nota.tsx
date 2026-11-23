import { StyleSheet, View } from 'react-native';

import { cores } from '../tema';
import { formatarNota } from '../utils/formatadores';
import { Icone } from './Icone';
import { Texto } from './Texto';

interface NotaProps {
  valor: number;
  tamanhoTexto?: number;
  tamanhoIcone?: number;
}

export function Nota({ valor, tamanhoTexto = 13, tamanhoIcone = 14 }: NotaProps) {
  return (
    <View style={estilos.linha}>
      <Icone nome="estrela" tamanho={tamanhoIcone} cor={cores.estrela} preenchimento={cores.estrela} espessura={0} />
      <Texto negrito tamanho={tamanhoTexto}>
        {formatarNota(valor)}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
