export function formatarNota(nota: number): string {
  return nota.toFixed(1);
}

export function formatarVotos(votos: number): string {
  if (votos < 1000) {
    return `${votos} ${votos === 1 ? 'voto' : 'votos'}`;
  }
  const milhares = votos / 1000;
  const texto = milhares >= 10 ? String(Math.round(milhares)) : milhares.toFixed(1).replace('.', ',');
  return `${texto.replace(/,0$/, '')} mil votos`;
}

export function formatarDuracao(minutos: number): string {
  if (!minutos) {
    return '—';
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) {
    return `${resto}min`;
  }
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

export function formatarData(dataIso?: string): string {
  if (!dataIso) {
    return '—';
  }
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function obterAno(dataIso?: string): string {
  return dataIso ? dataIso.slice(0, 4) : '';
}

export function formatarClassificacao(certificacao?: string): string {
  if (!certificacao) {
    return '—';
  }
  if (certificacao === 'L') {
    return 'Livre';
  }
  return /^\d+$/.test(certificacao) ? `${certificacao} anos` : certificacao;
}

export function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return '?';
  }
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function abreviarNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (nome.length <= 13 || partes.length === 1) {
    return nome;
  }
  return `${partes[0]} ${partes[partes.length - 1][0]}.`;
}

export function unirComPonto(partes: (string | undefined)[]): string {
  return partes.filter(Boolean).join(' · ');
}
