// Log centralizado de erros.
// Ponto único para, no futuro, plugar um serviço de monitoramento
// (Sentry, LogRocket, etc.) sem precisar mexer em cada tela.
export function logError(contexto, error, extra){
  if(extra !== undefined){
    console.error(`[${contexto}]`, error, extra);
  }else{
    console.error(`[${contexto}]`, error);
  }
}
