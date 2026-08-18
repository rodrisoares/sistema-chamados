import { useState, useEffect, useContext } from 'react';
import './detail.css';

import Header from '@/components/Header';
import Title from '@/components/Title';
import { AuthContext } from '@/contexts/auth';

import { useChamado } from '@/hooks/useChamado';
import { updateChamado, addInteracao } from '@/services/chamadosService';
import { corStatus, corPrioridade } from '@/utils/status';
import { logError } from '@/utils/logError';

import { useParams, useHistory, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { FiMessageSquare, FiEdit2, FiClock } from 'react-icons/fi';

export default function Detail(){
  const { id } = useParams();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const { chamado, setChamado, interacoes, loading, naoEncontrado } = useChamado(id);

  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');

  // Sincroniza o seletor de status quando o chamado carrega/atualiza
  useEffect(()=>{
    if(chamado){
      setNovoStatus(chamado.status);
    }
  }, [chamado]);


  async function handleComentar(e){
    e.preventDefault();

    if(comentario.trim() === ''){
      toast.warn('Digite um comentário antes de enviar.');
      return;
    }

    setEnviando(true);
    try{
      await addInteracao(id, {
        tipo: 'comentario',
        texto: comentario.trim(),
        autorNome: user.nome,
        autorId: user.uid
      });
      setComentario('');
    }catch(err){
      logError('Detail:comentar', err);
      toast.error('Erro ao enviar o comentário.');
    }finally{
      setEnviando(false);
    }
  }


  async function handleMudarStatus(){
    if(novoStatus === chamado.status){
      toast.info('O status selecionado já é o atual.');
      return;
    }

    const statusDe = chamado.status;
    setEnviando(true);
    try{
      const dadosUpdate = { status: novoStatus };
      // Marca/limpa o momento de finalização (tempo médio de resolução)
      if(novoStatus === 'Finalizado' && statusDe !== 'Finalizado'){
        dadosUpdate.finalizadoEm = new Date();
      }else if(novoStatus !== 'Finalizado' && statusDe === 'Finalizado'){
        dadosUpdate.finalizadoEm = null;
      }

      await updateChamado(id, dadosUpdate);

      await addInteracao(id, {
        tipo: 'status',
        texto: '',
        autorNome: user.nome,
        autorId: user.uid,
        statusDe: statusDe,
        statusPara: novoStatus
      });

      setChamado((c)=> ({ ...c, status: novoStatus }));
      toast.success('Status atualizado!');
    }catch(err){
      logError('Detail:mudarStatus', err);
      toast.error('Erro ao atualizar o status.');
    }finally{
      setEnviando(false);
    }
  }


  if(loading){
    return(
      <div>
        <Header/>
        <div className="content">
          <Title name="Detalhes do chamado">
            <FiMessageSquare size={25} />
          </Title>
          <div className="container chamados">
            <span>Carregando chamado...</span>
          </div>
        </div>
      </div>
    )
  }

  if(naoEncontrado || !chamado){
    return(
      <div>
        <Header/>
        <div className="content">
          <Title name="Detalhes do chamado">
            <FiMessageSquare size={25} />
          </Title>
          <div className="container chamados">
            <span>Chamado não encontrado.</span>
            <button className="btn-voltar-detail" onClick={ () => history.push('/chamados') }>Voltar</button>
          </div>
        </div>
      </div>
    )
  }

  const prioridade = chamado.prioridade || 'Baixa';
  const createdFormated = chamado.created ? format(chamado.created.toDate(), 'dd/MM/yyyy') : '-';

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Detalhes do chamado">
          <FiMessageSquare size={25} />
        </Title>

        <div className="container detail">

          <div className="detail-head">
            <h2>Chamado #{chamado.id.substring(0, 6)}</h2>
            <Link to={`/new/${chamado.id}`} className="detail-edit">
              <FiEdit2 size={16} /> Editar
            </Link>
          </div>

          <div className="detail-info">
            <span><b>Cliente:</b> {chamado.cliente}</span>
            <span><b>Assunto:</b> {chamado.assunto}</span>
            <span>
              <b>Prioridade:</b>{' '}
              <i className="detail-badge" style={{ backgroundColor: corPrioridade(prioridade) }}>{prioridade}</i>
            </span>
            <span><b>Cadastrado em:</b> {createdFormated}</span>
            <span>
              <b>Status:</b>{' '}
              <i className="detail-badge" style={{ backgroundColor: corStatus(chamado.status) }}>{chamado.status}</i>
            </span>
          </div>

          {chamado.complemento !== '' && (
            <>
              <h3>Descrição</h3>
              <p className="detail-desc">{chamado.complemento}</p>
            </>
          )}

          <h3>Alterar status</h3>
          <div className="detail-status-row">
            <select value={novoStatus} onChange={ (e) => setNovoStatus(e.target.value) }>
              <option value="Aberto">Aberto</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <button onClick={handleMudarStatus} disabled={enviando}>Atualizar status</button>
          </div>

          <h3>Adicionar comentário</h3>
          <form className="detail-comment-form" onSubmit={handleComentar}>
            <textarea
              placeholder="Escreva uma observação sobre o chamado..."
              maxLength={500}
              value={comentario}
              onChange={ (e) => setComentario(e.target.value) }
            />
            <small className="char-count">{comentario.length}/500 caracteres</small>
            <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Comentar'}</button>
          </form>

          <h3>Histórico</h3>
          <ul className="timeline">
            {interacoes.length === 0 ? (
              <li className="timeline-empty">Nenhuma interação registrada ainda.</li>
            ) : (
              interacoes.map((item)=>{
                const dataFormatada = item.created ? format(item.created.toDate(), 'dd/MM/yyyy HH:mm') : '';
                return(
                  <li key={item.id} className="timeline-item">
                    <span className="timeline-icon" style={{ backgroundColor: item.tipo === 'status' ? corStatus(item.statusPara) : '#3583f6' }}>
                      {item.tipo === 'status' ? <FiClock size={14} color="#FFF" /> : <FiMessageSquare size={14} color="#FFF" />}
                    </span>
                    <div className="timeline-body">
                      {item.tipo === 'status' ? (
                        item.statusDe ? (
                          <p><b>{item.autorNome || 'Usuário'}</b> alterou o status de <i>{item.statusDe}</i> para <i>{item.statusPara}</i></p>
                        ) : (
                          <p><b>{item.autorNome || 'Usuário'}</b> abriu o chamado como <i>{item.statusPara}</i></p>
                        )
                      ) : (
                        <p><b>{item.autorNome || 'Usuário'}</b> comentou: {item.texto}</p>
                      )}
                      <small>{dataFormatada}</small>
                    </div>
                  </li>
                )
              })
            )}
          </ul>

          <button className="btn-voltar-detail" onClick={ () => history.push('/chamados') }>Voltar</button>

        </div>
      </div>
    </div>
  )
}
