import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { mensagemDeErro } from '../hooks/useRequisicao';
import { cores } from '../tema';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

interface ModalAvaliacaoProps {
  visivel: boolean;
  titulo: string;
  notaAtual: number;
  onEnviar: (nota: number) => Promise<void>;
  onFechar: () => void;
}

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function ModalAvaliacao({ visivel, titulo, notaAtual, onEnviar, onFechar }: ModalAvaliacaoProps) {
  const [nota, setNota] = useState(notaAtual);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await onEnviar(nota);
      onFechar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onFechar}
    >
      <View style={estilos.fundo}>
        <View style={estilos.painel}>
          <Texto negrito tamanho={18} style={estilos.centro}>
            Avaliar {titulo}
          </Texto>
          <View style={estilos.notas}>
            {NOTAS.map((valor) => (
              <Pressable
                key={valor}
                accessibilityRole="button"
                accessibilityLabel={`Nota ${valor}`}
                accessibilityState={{ selected: valor === nota }}
                hitSlop={4}
                onPress={() => setNota(valor)}
              >
                <Icone
                  nome="estrela"
                  tamanho={26}
                  cor={valor <= nota ? cores.estrela : cores.textoFraco}
                  preenchimento={valor <= nota ? cores.estrela : 'none'}
                  espessura={1.6}
                />
              </Pressable>
            ))}
          </View>
          <Texto cor={cores.textoMedio} style={estilos.centro}>
            {nota > 0 ? `${nota}/10` : 'Escolha de 1 a 10'}
          </Texto>
          {erro && (
            <Texto tamanho={13} cor={cores.perigo} style={estilos.centro}>
              {erro}
            </Texto>
          )}
          <Botao rotulo="Enviar avaliação" desabilitado={nota === 0} carregando={enviando} onPress={enviar} />
          <Botao rotulo="Cancelar" variante="translucido" onPress={onFechar} />
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  painel: {
    gap: 14,
    padding: 20,
    borderRadius: 18,
    backgroundColor: cores.superficie,
  },
  centro: {
    textAlign: 'center',
  },
  notas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
