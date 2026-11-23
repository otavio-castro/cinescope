import { StyleSheet } from 'react-native';

import { cores } from '../tema';
import { FundoGradiente } from './FundoGradiente';
import { Icone } from './Icone';

export function Logo({ tamanho }: { tamanho: number }) {
  return (
    <FundoGradiente style={[estilos.caixa, { width: tamanho, height: tamanho, borderRadius: tamanho * 0.28 }]}>
      <Icone nome="reproduzir" tamanho={tamanho * 0.44} cor={cores.fundo} />
    </FundoGradiente>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
