import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGeneros } from '../hooks/useGeneros';
import { cores, margem } from '../tema';
import type { Genero, TipoTitulo } from '../tipos';
import { Carregando, MensagemErro } from './EstadoTela';
import { Icone } from './Icone';
import { Texto } from './Texto';

interface ModalCategoriasProps {
  visivel: boolean;
  midia: TipoTitulo;
  selecionado: Genero | null;
  onSelecionar: (genero: Genero | null) => void;
  onFechar: () => void;
}

const TODAS: Genero = { id: 0, nome: 'Todas as categorias' };

export function ModalCategorias({ visivel, midia, selecionado, onSelecionar, onFechar }: ModalCategoriasProps) {
  const { bottom } = useSafeAreaInsets();
  const { dados, carregando, erro, recarregar } = useGeneros(midia);

  const escolher = (genero: Genero) => {
    onSelecionar(genero.id === TODAS.id ? null : genero);
    onFechar();
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onFechar}
    >
      <Pressable style={estilos.fundo} onPress={onFechar} accessibilityLabel="Fechar categorias" />
      <View style={[estilos.painel, { paddingBottom: bottom + 12 }]}>
        <Texto negrito tamanho={18} style={estilos.titulo}>
          Categorias
        </Texto>
        {carregando && <Carregando />}
        {erro && <MensagemErro mensagem={erro} onTentarNovamente={recarregar} />}
        {dados && (
          <FlatList
            data={[TODAS, ...dados]}
            keyExtractor={(genero) => String(genero.id)}
            renderItem={({ item }) => {
              const ativo = item.id === (selecionado?.id ?? TODAS.id);
              return (
                <Pressable accessibilityRole="button" style={estilos.item} onPress={() => escolher(item)}>
                  <Texto tamanho={15} negrito={ativo} cor={ativo ? cores.primaria : cores.textoChip}>
                    {item.nome}
                  </Texto>
                  {ativo && <Icone nome="check" cor={cores.primaria} />}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  painel: {
    maxHeight: '65%',
    minHeight: 260,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: cores.superficie,
  },
  titulo: {
    paddingHorizontal: margem,
    paddingTop: 20,
    paddingBottom: 10,
  },
  item: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: margem,
  },
});
