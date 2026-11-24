import { useEffect, useState } from 'react';

export function useDebounce<T>(valor: T, atrasoMs: number): T {
  const [valorEstavel, setValorEstavel] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorEstavel(valor), atrasoMs);
    return () => clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return valorEstavel;
}
