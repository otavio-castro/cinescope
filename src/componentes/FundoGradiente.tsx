import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { gradiente } from '../tema';

interface FundoGradienteProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  coresGradiente?: readonly [string, string];
}

export function FundoGradiente({ children, style, coresGradiente = gradiente }: FundoGradienteProps) {
  const [fim, setFim] = useState({ x: 1, y: 1 });

  const ajustarDiagonal = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    const soma = width * width + height * height;
    if (soma > 0) {
      setFim({ x: (2 * height * height) / soma, y: (2 * width * width) / soma });
    }
  };

  return (
    <LinearGradient
      colors={coresGradiente}
      start={{ x: 0, y: 0 }}
      end={fim}
      style={style}
      onLayout={ajustarDiagonal}
    >
      {children}
    </LinearGradient>
  );
}
