import { Text, type TextProps } from 'react-native';

import { cores, fontes } from '../tema';

interface TextoProps extends TextProps {
  tamanho?: number;
  negrito?: boolean;
  cor?: string;
}

export function Texto({ tamanho = 14, negrito = false, cor = cores.texto, style, ...resto }: TextoProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.2}
      {...resto}
      style={[
        {
          fontSize: tamanho,
          color: cor,
          fontFamily: negrito ? fontes.negrito : fontes.regular,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}
