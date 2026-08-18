
// Cores dos status de chamado (usado na tela de Chamados e no Modal de detalhes)
export const STATUS_COR = {
  'Aberto': '#5cb85c',          // verde
  'Em Atendimento': '#f0ad4e',  // laranja
  'Finalizado': '#999999'       // cinza
};

export function corStatus(status){
  return STATUS_COR[status] || '#999999';
}

// Cores das prioridades de chamado
export const PRIORIDADE_COR = {
  'Alta': '#d9534f',    // vermelho
  'Média': '#f0ad4e',   // laranja
  'Baixa': '#5cb85c'    // verde
};

export function corPrioridade(prioridade){
  return PRIORIDADE_COR[prioridade] || '#999999';
}
