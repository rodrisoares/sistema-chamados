import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiSearch, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { corStatus, corPrioridade } from '@/utils/status';
import { estaAtrasado, horasAberto } from '../metrics';

export default function ChamadosTable({ chamados, sortField, sortDir, onSort, onView, onDelete }){

  function setaSort(field){
    if(sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  return(
    <div className="tabela-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col" className="th-sort" onClick={ () => onSort('id') }>ID{setaSort('id')}</th>
            <th scope="col" className="th-sort" onClick={ () => onSort('cliente') }>Cliente{setaSort('cliente')}</th>
            <th scope="col" className="th-sort" onClick={ () => onSort('assunto') }>Assunto{setaSort('assunto')}</th>
            <th scope="col" className="th-sort" onClick={ () => onSort('prioridade') }>Prioridade{setaSort('prioridade')}</th>
            <th scope="col" className="th-sort" onClick={ () => onSort('status') }>Status{setaSort('status')}</th>
            <th scope="col" className="th-sort" onClick={ () => onSort('created') }>Cadastrado em{setaSort('created')}</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {chamados.map((item)=>{
            const createdFormated = item.created ? format(item.created.toDate(), 'dd/MM/yyyy') : '-';
            return(
              <tr key={item.id}>
                <td data-label="ID">#{item.id.substring(0, 6)}</td>
                <td data-label="Cliente">{item.cliente}</td>
                <td data-label="Assunto">{item.assunto}</td>
                <td data-label="Prioridade">
                  <span className="badge" style={{ backgroundColor: corPrioridade(item.prioridade) }}>{item.prioridade}</span>
                </td>
                <td data-label="Status">
                  <div className="status-cell">
                    <span className="badge" style={{ backgroundColor: corStatus(item.status) }}>{item.status}</span>
                    {estaAtrasado(item) && (
                      <FiClock className="sla-icon" size={16} title={`Atrasado — aberto há ${Math.floor(horasAberto(item) / 24)} dia(s)`} />
                    )}
                  </div>
                </td>
                <td data-label="Cadastrado">{createdFormated}</td>
                <td data-label="#">
                  <button className="action" style={{backgroundColor: '#3583f6' }} onClick={ () => onView(item.id) }>
                    <FiSearch color="#FFF" size={17} />
                  </button>
                  <Link className="action" style={{backgroundColor: '#F6a935' }} to={`/new/${item.id}`} >
                    <FiEdit2 color="#FFF" size={17} />
                  </Link>
                  <button className="action" style={{backgroundColor: '#ff0000' }} onClick={ () => onDelete(item.id) }>
                    <FiTrash2 color="#FFF" size={17} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
