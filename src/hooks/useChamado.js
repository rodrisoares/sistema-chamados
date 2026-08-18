import { useState, useEffect } from 'react';
import { getChamado, subscribeInteracoes } from '@/services/chamadosService';
import { logError } from '@/utils/logError';

// Carrega um chamado específico e escuta sua timeline de interações.
export function useChamado(id){
  const [chamado, setChamado] = useState(null);
  const [interacoes, setInteracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function load(){
      try{
        const data = await getChamado(id);
        if(!ativo) return;
        if(data){
          setChamado(data);
        }else{
          setNaoEncontrado(true);
        }
      }catch(err){
        logError('useChamado', err);
        if(ativo) setNaoEncontrado(true);
      }finally{
        if(ativo) setLoading(false);
      }
    }

    load();

    const unsub = subscribeInteracoes(
      id,
      (lista) => { if(ativo) setInteracoes(lista); },
      (err) => logError('useChamado:interacoes', err)
    );

    return () => {
      ativo = false;
      unsub();
    };
  }, [id]);

  return { chamado, setChamado, interacoes, loading, naoEncontrado };
}
