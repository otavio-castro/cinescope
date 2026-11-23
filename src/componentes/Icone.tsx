import Svg, { Circle, Path, Polygon } from 'react-native-svg';

import { cores } from '../tema';

export type NomeIcone =
  | 'inicio'
  | 'buscar'
  | 'marcador'
  | 'perfil'
  | 'sino'
  | 'mais'
  | 'check'
  | 'fechar'
  | 'voltar'
  | 'avancar'
  | 'abrir'
  | 'compartilhar'
  | 'coracao'
  | 'estrela'
  | 'config'
  | 'link'
  | 'globo'
  | 'info'
  | 'reproduzir';

interface IconeProps {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
  preenchimento?: string;
  espessura?: number;
}

const CAMINHOS: Partial<Record<NomeIcone, string[]>> = {
  inicio: ['M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  buscar: ['M20 20l-3.5-3.5'],
  marcador: ['M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z'],
  perfil: ['M4 21a8 8 0 0 1 16 0'],
  sino: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  mais: ['M5 12h14M12 5v14'],
  check: ['M7.5 12l3 3 6-6'],
  fechar: ['M7 7l10 10M17 7L7 17'],
  voltar: ['M16 4l-8 8 8 8'],
  avancar: ['M9 5l7 7-7 7'],
  abrir: ['M6 9l6 6 6-6'],
  compartilhar: ['M12 3v12M17 8l-5-5-5 5M5 15v5h14v-5'],
  coracao: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
  ],
  config: [
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
  ],
  link: [
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  ],
  globo: ['M2 12h20', 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'],
  info: ['M12 16v-4M12 8h.01'],
};

const CIRCULOS: Partial<Record<NomeIcone, [number, number, number]>> = {
  buscar: [11, 11, 7],
  perfil: [12, 8, 4],
  config: [12, 12, 3],
  globo: [12, 12, 10],
  info: [12, 12, 10],
};

const PONTOS_ESTRELA =
  '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';

export function Icone({
  nome,
  tamanho = 24,
  cor = cores.texto,
  preenchimento = 'none',
  espessura = 2,
}: IconeProps) {
  if (nome === 'reproduzir') {
    return (
      <Svg width={tamanho * 0.75} height={tamanho} viewBox="0 0 12 16">
        <Path d="M0 0l12 8-12 8z" fill={cor} />
      </Svg>
    );
  }

  const circulo = CIRCULOS[nome];
  const traco = {
    stroke: cor,
    strokeWidth: (espessura * 24) / tamanho,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: preenchimento,
  } as const;

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      {nome === 'estrela' && <Polygon points={PONTOS_ESTRELA} {...traco} />}
      {CAMINHOS[nome]?.map((caminho) => <Path key={caminho} d={caminho} {...traco} />)}
      {circulo && <Circle cx={circulo[0]} cy={circulo[1]} r={circulo[2]} {...traco} />}
    </Svg>
  );
}
