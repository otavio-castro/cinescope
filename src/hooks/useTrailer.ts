import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { tmdbService } from '../servicos/tmdbService';
import type { TipoTitulo } from '../tipos';
import { mensagemDeErro } from './useRequisicao';

export function useTrailer() {
  const [abrindo, setAbrindo] = useState(false);

  const abrirTrailer = useCallback(async (tipo: TipoTitulo, id: number, urlConhecida?: string | null) => {
    setAbrindo(true);
    try {
      const url = urlConhecida ?? (await tmdbService.buscarTrailer(tipo, id));
      if (url) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        Alert.alert('Trailer indisponível', 'O TMDB ainda não tem trailer para este título.');
      }
    } catch (erro) {
      Alert.alert('Não foi possível abrir o trailer', mensagemDeErro(erro));
    } finally {
      setAbrindo(false);
    }
  }, []);

  return { abrirTrailer, abrindo };
}
