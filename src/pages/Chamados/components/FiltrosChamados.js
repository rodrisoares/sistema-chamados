import { FiSearch } from 'react-icons/fi';

export default function FiltrosChamados({
  search,
  onSearch,
  filtroStatus,
  soAtrasados,
  onFiltroStatus,
  filtroPrioridade,
  onFiltroPrioridade,
  dataInicio,
  onDataInicio,
  dataFim,
  onDataFim,
  filtrosAtivos,
  onLimpar
}){
  return(
    <div className="filtros">
      <div className="search-chamados">
        <FiSearch size={20} color="#999" />
        <input
          type="text"
          placeholder="Buscar por cliente ou assunto..."
          value={search}
          onChange={ (e) => onSearch(e.target.value) }
        />
      </div>

      <select value={soAtrasados ? 'atrasados' : filtroStatus} onChange={ (e) => onFiltroStatus(e.target.value) }>
        <option value="">Status: todos</option>
        <option value="Aberto">Aberto</option>
        <option value="Em Atendimento">Em Atendimento</option>
        <option value="Finalizado">Finalizado</option>
        <option value="atrasados">Atrasados</option>
      </select>

      <select value={filtroPrioridade} onChange={ (e) => onFiltroPrioridade(e.target.value) }>
        <option value="">Prioridade: todas</option>
        <option value="Baixa">Baixa</option>
        <option value="Média">Média</option>
        <option value="Alta">Alta</option>
      </select>

      <label className="filtro-data">
        De
        <input type="date" value={dataInicio} onChange={ (e) => onDataInicio(e.target.value) } />
      </label>
      <label className="filtro-data">
        Até
        <input type="date" value={dataFim} onChange={ (e) => onDataFim(e.target.value) } />
      </label>

      {filtrosAtivos && (
        <button className="btn-limpar" onClick={onLimpar}>Limpar filtros</button>
      )}
    </div>
  )
}
