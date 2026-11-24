import { StyleSheet, View } from 'react-native';

import { cores, coresElenco } from '../tema';
import { obterIniciais } from '../utils/formatadores';
import { Texto } from './Texto';

export function AvatarElenco({ nome, indice }: { nome: string; indice: number }) {
  return (
    <View style={[estilos.circulo, { backgroundColor: coresElenco[indice % coresElenco.length] }]}>
      <Texto negrito tamanho={15} cor={cores.texto}>
        {obterIniciais(nome)}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
