import { Pressable, StyleSheet, View } from 'react-native';

import { cores } from '../tema';
import type { Pessoa, Titulo } from '../tipos';
import { formatarVotos, obterIniciais, unirComPonto } from '../utils/formatadores';
import { FundoGradiente } from './FundoGradiente';
import { Icone } from './Icone';
import { ImagemTitulo } from './ImagemTitulo';
import { Nota } from './Nota';
import { Texto } from './Texto';

interface ItemTituloProps {
  titulo: Titulo;
  generos: string[];
  salvo: boolean;
  onAbrir: () => void;
  onAlternar: () => void;
}

export function ItemTitulo({ titulo, generos, salvo, onAbrir, onAlternar }: ItemTituloProps) {
  const tipo = titulo.tipo === 'movie' ? 'Filme' : 'Série';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tipo} ${titulo.titulo}`}
      onPress={onAbrir}
      style={({ pressed }) => [estilos.item, { opacity: pressed ? 0.75 : 1 }]}
    >
      <ImagemTitulo caminho={titulo.posterPath} style={estilos.poster} />
      <View style={[estilos.corpo, estilos.corpoTitulo]}>
        <View style={estilos.textos}>
          <Texto negrito tamanho={16} numberOfLines={1}>
            {titulo.titulo}
          </Texto>
          <Texto tamanho={13} cor={cores.textoMedio} numberOfLines={1} style={estilos.linhaTipo}>
            {unirComPonto([tipo, titulo.ano, generos.slice(0, 2).join(', ')])}
          </Texto>
          <View style={estilos.nota}>
            <Nota valor={titulo.nota} tamanhoIcone={13.2} />
            <Texto tamanho={12} cor={cores.textoFraco}>
              ({formatarVotos(titulo.votos)})
            </Texto>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={salvo ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
          accessibilityState={{ selected: salvo }}
          hitSlop={14}
          onPress={onAlternar}
          style={estilos.marcador}
        >
          <Icone
            nome="marcador"
            cor={salvo ? cores.primaria : cores.textoFraco}
            preenchimento={salvo ? cores.primaria : 'none'}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

export function ItemPessoa({ pessoa, onAbrir }: { pessoa: Pessoa; onAbrir: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Pessoa ${pessoa.nome}`}
      onPress={onAbrir}
      style={({ pressed }) => [estilos.item, { opacity: pressed ? 0.75 : 1 }]}
    >
      <FundoGradiente style={estilos.avatar}>
        <Texto negrito tamanho={20} cor={cores.fundo}>
          {obterIniciais(pessoa.nome)}
        </Texto>
      </FundoGradiente>
      <View style={[estilos.corpo, estilos.corpoPessoa]}>
        <View style={estilos.textos}>
          <Texto negrito tamanho={16} numberOfLines={1}>
            {pessoa.nome}
          </Texto>
          <Texto tamanho={13} cor={cores.textoMedio} style={estilos.linhaTipo}>
            Pessoa · {pessoa.departamento}
          </Texto>
          {pessoa.conhecidoPor.length > 0 && (
            <Texto tamanho={12} cor={cores.textoFraco} numberOfLines={1} style={estilos.conhecidoPor}>
              Conhecido por: {pessoa.conhecidoPor.join(', ')}
            </Texto>
          )}
        </View>
        <View style={estilos.seta}>
          <Icone nome="avancar" cor={cores.textoFraco} />
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  poster: {
    width: 64,
    height: 96,
    borderRadius: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: cores.divisor,
  },
  corpoTitulo: {
    height: 96,
    paddingTop: 10,
  },
  corpoPessoa: {
    height: 80,
  },
  textos: {
    flex: 1,
  },
  linhaTipo: {
    marginTop: 6,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  conhecidoPor: {
    marginTop: 5,
  },
  marcador: {
    paddingTop: 25,
    marginLeft: 8,
  },
  seta: {
    height: 64,
    justifyContent: 'center',
  },
});
