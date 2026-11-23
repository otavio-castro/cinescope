import { Pressable, StyleSheet, View } from 'react-native';

import { cores } from '../tema';
import { FundoGradiente } from './FundoGradiente';
import { Texto } from './Texto';

interface ChipProps {
  rotulo: string;
  ativo?: boolean;
  altura?: number;
  onPress?: () => void;
}

export function Chip({ rotulo, ativo = false, altura = 34, onPress }: ChipProps) {
  const formato = [estilos.chip, { height: altura, borderRadius: altura / 2 }];
  const texto = (
    <Texto negrito tamanho={13} cor={ativo ? cores.fundo : cores.textoChip}>
      {rotulo}
    </Texto>
  );
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: ativo }}
      disabled={!onPress}
      onPress={onPress}
    >
      {ativo ? (
        <FundoGradiente style={formato}>{texto}</FundoGradiente>
      ) : (
        <View style={[formato, estilos.inativo]}>{texto}</View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    justifyContent: 'center',
    paddingHorizontal: 15.5,
  },
  inativo: {
    paddingHorizontal: 14.5,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.bordaChip,
  },
});
