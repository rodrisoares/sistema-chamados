import { useState, useEffect } from 'react';

// Retorna o valor "atrasado" em `delay` ms após a última mudança.
// Útil para não filtrar/consultar a cada tecla digitada.
export function useDebounce(value, delay = 300){
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
