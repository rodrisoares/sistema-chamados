import { useState, useEffect, useCallback } from 'react';
import { getCustomers } from '@/services/customersService';
import { getChamados } from '@/services/chamadosService';
import { logError } from '@/utils/logError';

// Carrega os clientes e, para cada um, a contagem de chamados (total e em aberto).
export function useCustomers(){
  const [customers, setCustomers] = useState([]);
  const [contagens, setContagens] = useState({}); // clienteId -> { total, abertos }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try{
      const lista = await getCustomers();
      setCustomers(lista);

      const chamados = await getChamados();
      const mapa = {};
      chamados.forEach((d) => {
        if(!d.clienteId) return;
        if(!mapa[d.clienteId]) mapa[d.clienteId] = { total: 0, abertos: 0 };
        mapa[d.clienteId].total += 1;
        if(d.status !== 'Finalizado') mapa[d.clienteId].abertos += 1;
      });
      setContagens(mapa);
    }catch(err){
      logError('useCustomers', err);
    }finally{
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { customers, setCustomers, contagens, loading, reload: load };
}
