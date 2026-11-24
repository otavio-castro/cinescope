import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BarraAbas } from '../componentes/BarraAbas';
import { useAuth } from '../contextos/AuthContext';
import { BuscarTela } from '../telas/BuscarTela';
import { CatalogoTela } from '../telas/CatalogoTela';
import { DetalheTela } from '../telas/DetalheTela';
import { ElencoTela } from '../telas/ElencoTela';
import { EntradaTela } from '../telas/EntradaTela';
import { InicioTela } from '../telas/InicioTela';
import { MinhaListaTela } from '../telas/MinhaListaTela';
import { PerfilTela } from '../telas/PerfilTela';
import { cores } from '../tema';
import type { AbasParams, PilhaParams } from './tipos';

const Pilha = createNativeStackNavigator<PilhaParams>();
const Abas = createBottomTabNavigator<AbasParams>();

const temaNavegacao = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.fundo,
    text: cores.texto,
  },
};

function NavegacaoAbas() {
  return (
    <Abas.Navigator tabBar={(props) => <BarraAbas {...props} />} screenOptions={{ headerShown: false }}>
      <Abas.Screen name="Inicio" component={InicioTela} />
      <Abas.Screen name="Buscar" component={BuscarTela} />
      <Abas.Screen name="MinhaLista" component={MinhaListaTela} />
      <Abas.Screen name="Perfil" component={PerfilTela} />
    </Abas.Navigator>
  );
}

export function Navegacao() {
  const { sessao } = useAuth();

  return (
    <NavigationContainer theme={temaNavegacao}>
      <Pilha.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
        {sessao ? (
          <>
            <Pilha.Screen name="Abas" component={NavegacaoAbas} />
            <Pilha.Screen name="Detalhe" component={DetalheTela} />
            <Pilha.Screen name="Catalogo" component={CatalogoTela} />
            <Pilha.Screen name="Elenco" component={ElencoTela} />
          </>
        ) : (
          <Pilha.Screen name="Entrada" component={EntradaTela} />
        )}
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
