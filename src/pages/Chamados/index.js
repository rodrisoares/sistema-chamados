import './chamados.css';
import { useState, useEffect, useMemo } from 'react';

import Header from '@/components/Header';
import Title from '@/components/Title';
import ModalConfirm from '@/components/ModalConfirm';
import { FiMessageSquare, FiPlus } from 'react-icons/fi';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useChamados } from '@/hooks/useChamados';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteChamado } from '@/services/chamadosService';
import { logError } from '@/utils/logError';

import CardsIndicadores from './components/CardsIndicadores';
import FiltrosChamados from './components/FiltrosChamados';
import ChamadosTable from './components/ChamadosTable';
import ChartsPanel from './components/ChartsPanel';
import {
  calcularTotais,
  filtrarChamados,
  ordenarChamados,
  calcularGrafico,
  calcularPizzaPrioridade,
  calcularTempoMedio
} from './metrics';

export default function Chamados(){
  const history = useHistory();
  const location = useLocation();

  const { chamados, loading } = useChamados();

  const [deleteId, setDeleteId] = useState(null);

  // Filtros iniciais lidos da URL: permite voltar de um chamado (ou compartilhar
  // o link) preservando busca, status, prioridade e período.
  const paramsIniciais = new URLSearchParams(location.search);
  const [search, setSearch] = useState(paramsIniciais.get('busca') || '');
  const [filtroStatus, setFiltroStatus] = useState(paramsIniciais.get('status') || '');
  const [filtroPrioridade, setFiltroPrioridade] = useState(paramsIniciais.get('prioridade') || '');
  const [dataInicio, setDataInicio] = useState(paramsIniciais.get('de') || '');
  const [dataFim, setDataFim] = useState(paramsIniciais.get('ate') || '');
  const [soAtrasados, setSoAtrasados] = useState(paramsIniciais.get('atrasados') === '1');
  const [filtroCliente, setFiltroCliente] = useState(paramsIniciais.get('cliente') || '');

  // Ordenação da tabela
  const [sortField, setSortField] = useState('created');
  const [sortDir, setSortDir] = useState('desc');

  // Busca com debounce: filtra a tabela sem reagir a cada tecla
  const buscaDebounced = useDebounce(search, 300);

  // Mantém a URL em sincronia com os filtros (persistência ao navegar/voltar)
  useEffect(()=>{
    const p = new URLSearchParams();
    if(search) p.set('busca', search);
    if(filtroStatus) p.set('status', filtroStatus);
    if(filtroPrioridade) p.set('prioridade', filtroPrioridade);
    if(dataInicio) p.set('de', dataInicio);
    if(dataFim) p.set('ate', dataFim);
    if(soAtrasados) p.set('atrasados', '1');
    if(filtroCliente) p.set('cliente', filtroCliente);

    const qs = p.toString();
    history.replace(qs ? `/chamados?${qs}` : '/chamados');
  }, [search, filtroStatus, filtroPrioridade, dataInicio, dataFim, soAtrasados, filtroCliente, history]);


  // --- Dados derivados (memoizados) ---
  const totais = useMemo(() => calcularTotais(chamados), [chamados]);

  const filtered = useMemo(() => filtrarChamados(chamados, {
    busca: buscaDebounced,
    status: filtroStatus,
    prioridade: filtroPrioridade,
    dataInicio,
    dataFim,
    soAtrasados,
    cliente: filtroCliente
  }), [chamados, buscaDebounced, filtroStatus, filtroPrioridade, dataInicio, dataFim, soAtrasados, filtroCliente]);

  const sorted = useMemo(() => ordenarChamados(filtered, sortField, sortDir), [filtered, sortField, sortDir]);

  const grafico = useMemo(() => calcularGrafico(chamados), [chamados]);
  const pizzaPrioridade = useMemo(() => calcularPizzaPrioridade(chamados), [chamados]);
  const tempoMedio = useMemo(() => calcularTempoMedio(chamados), [chamados]);

  // Nome do cliente atualmente filtrado (para o "chip" removível)
  const nomeClienteFiltro = filtroCliente
    ? (chamados.find(c => c.clienteId === filtroCliente)?.cliente || 'Cliente')
    : '';

  const filtrosAtivos = search !== '' || filtroStatus !== '' || filtroPrioridade !== '' || dataInicio !== '' || dataFim !== '' || soAtrasados || filtroCliente !== '';


  // Status e "atrasados" são mutuamente exclusivos: um chamado atrasado nunca
  // está Finalizado, então combinar os dois filtros zeraria o grid mesmo com
  // os cards exibindo contagens. Ao mexer em um, limpamos o outro.
  function selecionarStatus(status){
    setFiltroStatus(status);
    setSoAtrasados(false);
  }

  function toggleFiltroStatus(status){
    setFiltroStatus(atual => atual === status ? '' : status);
    setSoAtrasados(false);
  }

  function toggleAtrasados(){
    setSoAtrasados(v => !v);
    setFiltroStatus('');
  }

  // Select unificado: trata "atrasados" como um valor especial ao lado dos status
  function onSelectStatus(value){
    if(value === 'atrasados'){
      setSoAtrasados(true);
      setFiltroStatus('');
    }else{
      selecionarStatus(value);
    }
  }

  function handleSort(field){
    if(sortField === field){
      setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');
    }else{
      setSortField(field);
      setSortDir(field === 'created' ? 'desc' : 'asc');
    }
  }

  function limparFiltros(){
    setSearch('');
    setFiltroStatus('');
    setFiltroPrioridade('');
    setDataInicio('');
    setDataFim('');
    setSoAtrasados(false);
    setFiltroCliente('');
  }

  async function handleDelete(){
    const id = deleteId;
    setDeleteId(null);

    try{
      await deleteChamado(id);
      toast.success('Chamado excluído com sucesso!');
      // A lista atualiza sozinha via onSnapshot
    }catch(err){
      logError('Chamados:delete', err);
      toast.error('Erro ao excluir o chamado.');
    }
  }


  if(loading){
    return(
      <div>
        <Header/>

        <div className="content">
          <Title name="Chamados">
            <FiMessageSquare size={25} />
          </Title>

          <div className="cards">
            {[1,2,3,4].map((i)=>(
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>

          <div className="skeleton-list">
            {[1,2,3,4,5].map((i)=>(
              <div key={i} className="skeleton skeleton-row" />
            ))}
          </div>

        </div>
      </div>
    )
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Chamados">
          <FiMessageSquare size={25} />
        </Title>

        {chamados.length === 0 ? (
          <div className="container chamados">
            <span>Nenhum chamado registrado...</span>

            <Link to="/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo chamado
            </Link>
          </div>
        )  : (
          <>
            <CardsIndicadores
              totais={totais}
              filtroStatus={filtroStatus}
              soAtrasados={soAtrasados}
              onSetStatus={selecionarStatus}
              onToggleStatus={toggleFiltroStatus}
              onToggleAtrasados={toggleAtrasados}
            />

            <Link to="/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo chamado
            </Link>

            <FiltrosChamados
              search={search}
              onSearch={setSearch}
              filtroStatus={filtroStatus}
              soAtrasados={soAtrasados}
              onFiltroStatus={onSelectStatus}
              filtroPrioridade={filtroPrioridade}
              onFiltroPrioridade={setFiltroPrioridade}
              dataInicio={dataInicio}
              onDataInicio={setDataInicio}
              dataFim={dataFim}
              onDataFim={setDataFim}
              filtrosAtivos={filtrosAtivos}
              onLimpar={limparFiltros}
            />

            {filtroCliente && (
              <div className="filtro-chip">
                Filtrando por cliente: <b>{nomeClienteFiltro}</b>
                <button onClick={ () => setFiltroCliente('') } aria-label="Remover filtro de cliente">×</button>
              </div>
            )}

            <p className="resultado-contagem">{filtered.length} de {chamados.length} chamado(s)</p>

            {filtered.length === 0 ? (
              <div className="container chamados">
                <span>Nenhum chamado encontrado com os filtros aplicados.</span>
              </div>
            ) : (
              <ChamadosTable
                chamados={sorted}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                onView={ (id) => history.push(`/chamado/${id}`) }
                onDelete={setDeleteId}
              />
            )}

            <ChartsPanel
              grafico={grafico.dias}
              graficoTemDados={grafico.temDados}
              pizzaPrioridade={pizzaPrioridade}
              tempoMedioTexto={tempoMedio.texto}
              resolvidosCount={tempoMedio.quantidade}
            />

          </>
        )}

      </div>

      {deleteId && (
        <ModalConfirm
          titulo="Excluir chamado"
          mensagem="Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita."
          textoConfirmar="Excluir"
          onConfirm={handleDelete}
          onCancel={ () => setDeleteId(null) }
        />
      )}

    </div>
  )
}
