import { StyleSheet, View } from 'react-native';

import { useSugestao } from '../hooks/useSugestao';
import { cores } from '../tema';
import type { ItemLista } from '../tipos';
import { Botao } from './Botao';
import { FundoGradiente } from './FundoGradiente';
import { ImagemTitulo } from './ImagemTitulo';
import { Texto } from './Texto';

interface CartaoSugestaoProps {
  base: ItemLista;
  onVerSugestoes: () => void;
}

const GRADIENTE_CARTAO = ['rgba(1,180,228,0.24)', 'rgba(144,206,161,0.08)'] as const;

export function CartaoSugestao({ base, onVerSugestoes }: CartaoSugestaoProps) {
  const sugestao = useSugestao(base);

  if (!sugestao) {
    return null;
  }
  return (
    <FundoGradiente coresGradiente={GRADIENTE_CARTAO} style={estilos.cartao}>
      <View style={estilos.textos}>
        <Texto negrito tamanho={11} cor={cores.primariaClara}>
          PARA VOCÊ
        </Texto>
        <Texto cor={cores.textoCorpo} style={estilos.motivo}>
          Porque você salvou
        </Texto>
        <Texto negrito tamanho={22} numberOfLines={1} style={estilos.titulo}>
          {base.titulo}
        </Texto>
        <Botao
          rotulo="Ver sugestões"
          variante="claro"
          altura={30}
          raio={15}
          tamanhoTexto={13}
          onPress={onVerSugestoes}
          style={estilos.botao}
        />
      </View>
      <ImagemTitulo caminho={sugestao.posterPath} style={estilos.poster} />
    </FundoGradiente>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    minHeight: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 15,
    paddingLeft: 15,
    paddingRight: 17,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(1,180,228,0.30)',
    overflow: 'hidden',
  },
  textos: {
    flex: 1,
  },
  motivo: {
    marginTop: 10,
  },
  titulo: {
    marginTop: 3,
    lineHeight: 27,
  },
  botao: {
    width: 140,
    marginTop: 9,
  },
  poster: {
    width: 76,
    height: 114,
    borderRadius: 8,
  },
});
