import { SLA_HORAS } from '../metrics';

// Cards de indicadores (clicáveis para filtrar por status)
export default function CardsIndicadores({
  totais,
  filtroStatus,
  soAtrasados,
  onSetStatus,
  onToggleStatus,
  onToggleAtrasados
}){
  return(
    <div className="cards">
      <button className={`card ${filtroStatus === '' && !soAtrasados ? 'card-active' : ''}`} onClick={ () => onSetStatus('') }>
        <span className="card-num">{totais.total}</span>
        <span className="card-label">Total</span>
      </button>
      <button className={`card card-aberto ${filtroStatus === 'Aberto' ? 'card-active' : ''}`} onClick={ () => onToggleStatus('Aberto') }>
        <span className="card-num">{totais.abertos}</span>
        <span className="card-label">Abertos</span>
      </button>
      <button className={`card card-atendimento ${filtroStatus === 'Em Atendimento' ? 'card-active' : ''}`} onClick={ () => onToggleStatus('Em Atendimento') }>
        <span className="card-num">{totais.atendimento}</span>
        <span className="card-label">Em Atendimento</span>
      </button>
      <button className={`card card-finalizado ${filtroStatus === 'Finalizado' ? 'card-active' : ''}`} onClick={ () => onToggleStatus('Finalizado') }>
        <span className="card-num">{totais.finalizados}</span>
        <span className="card-label">Finalizados</span>
      </button>
      <button className={`card card-atrasado ${soAtrasados ? 'card-active' : ''}`} onClick={onToggleAtrasados}>
        <span className="card-num">{totais.atrasados}</span>
        <span className="card-label">Atrasados (+{SLA_HORAS}h)</span>
      </button>
    </div>
  )
}
