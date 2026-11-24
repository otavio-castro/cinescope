import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './contextos/AuthContext';
import { ListaProvider } from './contextos/ListaContext';
import { Navegacao } from './navegacao/Navegacao';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Conteudo() {
  const { carregando } = useAuth();
  const [fontesCarregadas, erroFontes] = useFonts({ Inter_400Regular, Inter_700Bold });
  const pronto = !carregando && (fontesCarregadas || erroFontes !== null);

  useEffect(() => {
    if (pronto) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [pronto]);

  return pronto ? <Navegacao /> : null;
}

export function Aplicativo() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <ListaProvider>
          <Conteudo />
        </ListaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
