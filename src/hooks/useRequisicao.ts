import { useCallback, useEffect, useRef, useState } from 'react';

interface EstadoRequisicao<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
}

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.';
}

export function useRequisicao<T>(consultar: () => Promise<T>) {
  const [estado, setEstado] = useState<EstadoRequisicao<T>>({ dados: null, carregando: true, erro: null });
  const versao = useRef(0);

  const recarregar = useCallback(async () => {
    versao.current += 1;
    const atual = versao.current;
    setEstado((anterior) => ({ ...anterior, carregando: true, erro: null }));
    try {
      const dados = await consultar();
      if (atual === versao.current) {
        setEstado({ dados, carregando: false, erro: null });
      }
    } catch (erro) {
      if (atual === versao.current) {
        setEstado((anterior) => ({ ...anterior, carregando: false, erro: mensagemDeErro(erro) }));
      }
    }
  }, [consultar]);

  useEffect(() => {
    setEstado({ dados: null, carregando: true, erro: null });
    recarregar();
    return () => {
      versao.current += 1;
    };
  }, [recarregar]);

  return { ...estado, recarregar };
}
