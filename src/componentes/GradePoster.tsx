import { useWindowDimensions, Pressable, StyleSheet, View } from 'react-native';

import { cores, margem } from '../tema';
import { formatarNota, unirComPonto } from '../utils/formatadores';
import { Icone } from './Icone';
import { ImagemTitulo } from './ImagemTitulo';
import { Texto } from './Texto';

export const COLUNAS_GRADE = 3;
export const ESPACO_GRADE = 13;

interface GradePosterProps {
  titulo: string;
  ano: string;
  nota: number;
  posterPath: string | null;
  assistido?: boolean;
  editando?: boolean;
  onPress: () => void;
  onRemover?: () => void;
}

export function useLarguraGrade(): number {
  const { width } = useWindowDimensions();
  return Math.floor((width - margem * 2 - ESPACO_GRADE * (COLUNAS_GRADE - 1)) / COLUNAS_GRADE);
}

export function GradePoster({
  titulo,
  ano,
  nota,
  posterPath,
  assistido = false,
  editando = false,
  onPress,
  onRemover,
}: GradePosterProps) {
  const largura = useLarguraGrade();

  return (
    <View style={{ width: largura }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={assistido ? `${titulo}, assistido` : titulo}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <ImagemTitulo caminho={posterPath} style={[estilos.poster, { width: largura, height: largura * 1.5 }]} />
        {(assistido || editando) && (
          <View style={[estilos.selo, !assistido && estilos.seloVazio]}>
            {assistido && <Icone nome="check" tamanho={20} cor={cores.fundo} />}
          </View>
        )}
        <Texto negrito tamanho={13} numberOfLines={1} style={estilos.titulo}>
          {titulo}
        </Texto>
        <Texto tamanho={11} cor={cores.textoFraco} numberOfLines={1} style={estilos.legenda}>
          {unirComPonto([ano, `Nota ${formatarNota(nota)}`])}
        </Texto>
      </Pressable>
      {editando && onRemover && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${titulo} da lista`}
          hitSlop={10}
          onPress={onRemover}
          style={estilos.remover}
        >
          <Icone nome="fechar" tamanho={18} />
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  poster: {
    borderRadius: 12,
  },
  selo: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primaria,
  },
  seloVazio: {
    borderWidth: 1.5,
    borderColor: cores.texto,
    backgroundColor: 'rgba(13,15,20,0.55)',
  },
  titulo: {
    marginTop: 5,
  },
  legenda: {
    marginTop: 2,
  },
  remover: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.perigo,
  },
});
