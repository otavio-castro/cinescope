import { useCallback, useEffect, useRef, useState } from 'react';

import { tmdbService } from '../servicos/tmdbService';
import type { FonteCatalogo, Titulo } from '../tipos';
import { mensagemDeErro } from './useRequisicao';

function unirSemRepetir(atuais: Titulo[], novos: Titulo[]): Titulo[] {
  const chaves = new Set(atuais.map((item) => `${item.tipo}-${item.id}`));
  return [...atuais, ...novos.filter((item) => !chaves.has(`${item.tipo}-${item.id}`))];
}

export function useCatalogo(fonte: FonteCatalogo) {
  const [itens, setItens] = useState<Titulo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const controle = useRef({ ocupado: false, proxima: 1, total: 1 });
  const fonteInicial = useRef(fonte);

  const carregarMais = useCallback(async () => {
    const estado = controle.current;
    if (estado.ocupado || estado.proxima > estado.total) {
      return;
    }
    estado.ocupado = true;
    setCarregando(true);
    setErro(null);
    try {
      const pagina = await tmdbService.buscarPaginaCatalogo(fonteInicial.current, estado.proxima);
      estado.proxima = pagina.pagina + 1;
      estado.total = pagina.totalPaginas;
      setItens((atuais) => unirSemRepetir(atuais, pagina.itens));
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      estado.ocupado = false;
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarMais();
  }, [carregarMais]);

  return { itens, carregando, erro, carregarMais };
}
