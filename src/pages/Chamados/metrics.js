import { format } from 'date-fns';
import { corPrioridade } from '@/utils/status';

// Chamados não-finalizados abertos há mais que isso são considerados atrasados (SLA)
export const SLA_HORAS = 48;
export const DIAS_GRAFICO = 14;

// Ordem lógica para a ordenação por coluna
export const ORDEM_PRIORIDADE = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
export const ORDEM_STATUS = { 'Aberto': 1, 'Em Atendimento': 2, 'Finalizado': 3 };

// SLA: horas desde a abertura e se o chamado está atrasado
export function horasAberto(item){
  if(!item.created) return 0;
  return (Date.now() - item.created.toDate().getTime()) / 3600000;
}

export function estaAtrasado(item){
  return item.status !== 'Finalizado' && horasAberto(item) > SLA_HORAS;
}

// Indicadores (sobre a base inteira)
export function calcularTotais(chamados){
  return {
    total: chamados.length,
    abertos: chamados.filter(c => c.status === 'Aberto').length,
    atendimento: chamados.filter(c => c.status === 'Em Atendimento').length,
    finalizados: chamados.filter(c => c.status === 'Finalizado').length,
    atrasados: chamados.filter(estaAtrasado).length
  };
}

// Aplica todos os filtros combinados
export function filtrarChamados(chamados, filtros){
  const { busca, status, prioridade, dataInicio, dataFim, soAtrasados, cliente } = filtros;

  return chamados.filter((item) => {
    const termo = (busca || '').trim().toLowerCase();
    if(termo !== ''){
      const casa = (item.cliente || '').toLowerCase().includes(termo) ||
                   (item.assunto || '').toLowerCase().includes(termo);
      if(!casa) return false;
    }

    if(status !== '' && item.status !== status) return false;
    if(prioridade !== '' && item.prioridade !== prioridade) return false;
    if(soAtrasados && !estaAtrasado(item)) return false;
    if(cliente !== '' && item.clienteId !== cliente) return false;

    if(dataInicio !== '' || dataFim !== ''){
      const dataChamado = item.created ? item.created.toDate() : null;
      if(!dataChamado) return false;
      if(dataInicio !== '' && dataChamado < new Date(`${dataInicio}T00:00:00`)) return false;
      if(dataFim !== '' && dataChamado > new Date(`${dataFim}T23:59:59`)) return false;
    }

    return true;
  });
}

// Ordenação por coluna
export function ordenarChamados(lista, sortField, sortDir){
  const sorted = [...lista].sort((a, b) => {
    let cmp = 0;
    switch(sortField){
      case 'id':         cmp = a.id.localeCompare(b.id); break;
      case 'cliente':    cmp = (a.cliente || '').localeCompare(b.cliente || ''); break;
      case 'assunto':    cmp = (a.assunto || '').localeCompare(b.assunto || ''); break;
      case 'prioridade': cmp = (ORDEM_PRIORIDADE[a.prioridade] || 0) - (ORDEM_PRIORIDADE[b.prioridade] || 0); break;
      case 'status':     cmp = (ORDEM_STATUS[a.status] || 0) - (ORDEM_STATUS[b.status] || 0); break;
      case 'created':
      default: {
        const ta = a.created ? a.created.toDate().getTime() : 0;
        const tb = b.created ? b.created.toDate().getTime() : 0;
        cmp = ta - tb;
        break;
      }
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// Dados do gráfico: chamados criados por dia (últimos N dias), quebrados por status
export function calcularGrafico(chamados){
  const dias = [];
  for(let i = DIAS_GRAFICO - 1; i >= 0; i--){
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const proximo = new Date(d);
    proximo.setDate(d.getDate() + 1);

    const doDia = chamados.filter((c)=>{
      if(!c.created) return false;
      const dc = c.created.toDate();
      return dc >= d && dc < proximo;
    });

    dias.push({
      dia: format(d, 'dd/MM'),
      'Aberto': doDia.filter(c => c.status === 'Aberto').length,
      'Em Atendimento': doDia.filter(c => c.status === 'Em Atendimento').length,
      'Finalizado': doDia.filter(c => c.status === 'Finalizado').length
    });
  }

  // Só há o que mostrar se algum dia do período tem chamados
  const temDados = dias.some(d => d.Aberto + d['Em Atendimento'] + d.Finalizado > 0);
  return { dias, temDados };
}

// Distribuição por prioridade (rosca), sobre a base inteira
export function calcularPizzaPrioridade(chamados){
  return [
    { name: 'Alta',  value: chamados.filter(c => c.prioridade === 'Alta').length,  cor: corPrioridade('Alta') },
    { name: 'Média', value: chamados.filter(c => c.prioridade === 'Média').length, cor: corPrioridade('Média') },
    { name: 'Baixa', value: chamados.filter(c => c.prioridade === 'Baixa').length, cor: corPrioridade('Baixa') }
  ].filter(x => x.value > 0);
}

// Tempo médio de resolução: média de (finalizadoEm - created) dos finalizados
export function calcularTempoMedio(chamados){
  const resolvidos = chamados.filter(c => c.created && c.finalizadoEm);
  let texto = '—';

  if(resolvidos.length > 0){
    const somaHoras = resolvidos.reduce((acc, c) => (
      acc + (c.finalizadoEm.toDate().getTime() - c.created.toDate().getTime()) / 3600000
    ), 0);
    const mediaHoras = somaHoras / resolvidos.length;
    texto = mediaHoras >= 24
      ? `${(mediaHoras / 24).toFixed(1)} dia(s)`
      : `${mediaHoras.toFixed(1)}h`;
  }

  return { texto, quantidade: resolvidos.length };
}
