import { useState, useEffect } from 'react';
import { subscribeChamados } from '@/services/chamadosService';
import { logError } from '@/utils/logError';

// Normaliza o documento cru do Firestore aplicando os valores padrão.
// Mantém `created`/`finalizadoEm` como Timestamp (a formatação é feita na view).
function normalize(item){
  return {
    id: item.id,
    assunto: item.assunto,
    cliente: item.cliente,
    clienteId: item.clienteId,
    created: item.created || null,
    prioridade: item.prioridade || 'Baixa',
    status: item.status,
    complemento: item.complemento,
    finalizadoEm: item.finalizadoEm || null
  };
}

// Escuta a lista de chamados em tempo real.
export function useChamados(){
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeChamados(
      (lista) => {
        setChamados(lista.map(normalize));
        setLoading(false);
      },
      (err) => {
        logError('useChamados', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { chamados, loading };
}
