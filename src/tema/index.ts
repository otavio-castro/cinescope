export const cores = {
  fundo: '#0D0F14',
  superficie: '#1B1D26',
  superficieAtiva: '#2C303C',
  barra: 'rgba(18,20,27,0.97)',
  primaria: '#01B4E4',
  primariaClara: '#3FD0F5',
  secundaria: '#90CEA1',
  texto: '#FFFFFF',
  textoChip: '#D5DAE3',
  textoCorpo: '#B4BBC8',
  textoMedio: '#9EA6B4',
  textoFraco: '#7C8494',
  textoLegal: '#6B7383',
  estrela: '#F5C518',
  perigo: '#FF5A6E',
  botaoLimpar: '#3A3F4D',
  divisor: 'rgba(255,255,255,0.07)',
  bordaChip: 'rgba(255,255,255,0.10)',
  bordaForte: 'rgba(255,255,255,0.22)',
} as const;

export const coresElenco = ['#2B3A55', '#4A2E3F', '#3A4A3A', '#4B3B2A', '#2E4A4F'] as const;

export const gradiente = [cores.primaria, cores.secundaria] as const;

export const fontes = {
  regular: 'Inter_400Regular',
  negrito: 'Inter_700Bold',
} as const;

export const margem = 20;
export const alturaBarraAbas = 62;
