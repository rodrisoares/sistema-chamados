import { useState, useEffect, useContext } from 'react';

import { getCustomers } from '@/services/customersService';
import { getChamado, createChamado, updateChamado, addInteracao } from '@/services/chamadosService';
import { useHistory, useParams } from 'react-router-dom';

import Header from '@/components/Header';
import Title from '@/components/Title';
import { AuthContext } from '@/contexts/auth';
import { toast } from 'react-toastify';
import { logError } from '@/utils/logError';

import './new.css';
import { FiPlusCircle, FiSave, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom';
export default function New(){
  const { id } = useParams();
  const history = useHistory();

  const [loadCustomers, setLoadCustomers] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [assunto, setAssunto] = useState('Suporte');
  const [prioridade, setPrioridade] = useState('Baixa');
  const [status, setStatus] = useState('Aberto');
  const [complemento, setComplemento] = useState('');

  const [idCustomer, setIdCustomer] = useState(false);
  const [statusOriginal, setStatusOriginal] = useState('Aberto');
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);


  useEffect(()=> {
    async function loadCustomersList(){
      try{
        const lista = await getCustomers();

        if(lista.length === 0){
          setCustomers([ { id: '1', nomeFantasia: 'FREELA' } ]);
          setLoadCustomers(false);
          return;
        }

        setCustomers(lista);
        setLoadCustomers(false);

        if(id){
          loadId(lista);
        }
      }catch(error){
        logError('New:loadCustomers', error);
        setLoadCustomers(false);
        setCustomers([ { id: '1', nomeFantasia: '' } ]);
      }
    }

    loadCustomersList();

  }, [id]);



  async function loadId(lista){
    try{
      const data = await getChamado(id);
      if(!data){
        logError('New:loadId', new Error('Chamado não encontrado'));
        setIdCustomer(false);
        return;
      }

      setAssunto(data.assunto);
      setPrioridade(data.prioridade || 'Baixa');
      setStatus(data.status);
      setStatusOriginal(data.status);
      setComplemento(data.complemento)

      let index = lista.findIndex(item => item.id === data.clienteId );

      if(index === -1){
        // Cliente vinculado não está na lista (ex: removido) — preserva o original
        const clienteOriginal = {
          id: data.clienteId,
          nomeFantasia: data.cliente || 'Cliente removido'
        };
        const novaLista = [...lista, clienteOriginal];
        setCustomers(novaLista);
        setCustomerSelected(novaLista.length - 1);
      }else{
        setCustomerSelected(index);
      }

      setIdCustomer(true);
    }catch(err){
      logError('New:loadId', err);
      setIdCustomer(false);
    }
  }

  async function handleRegister(e){
    e.preventDefault();

    const clienteAtual = customers[customerSelected];
    if(!clienteAtual){
      toast.error('Selecione um cliente válido antes de continuar.');
      return;
    }

    setLoading(true);

    if(idCustomer){
      const dadosUpdate = {
        cliente: clienteAtual.nomeFantasia,
        clienteId: clienteAtual.id,
        assunto: assunto,
        prioridade: prioridade,
        status: status,
        complemento: complemento,
        userId: user.uid
      };

      // Marca/limpa o momento de finalização (usado no tempo médio de resolução)
      if(status === 'Finalizado' && statusOriginal !== 'Finalizado'){
        dadosUpdate.finalizadoEm = new Date();
      }else if(status !== 'Finalizado' && statusOriginal === 'Finalizado'){
        dadosUpdate.finalizadoEm = null;
      }

      try{
        await updateChamado(id, dadosUpdate);

        if(status !== statusOriginal){
          await addInteracao(id, {
            tipo: 'status',
            texto: '',
            autorNome: user.nome,
            autorId: user.uid,
            statusDe: statusOriginal,
            statusPara: status
          });
          setStatusOriginal(status);
        }

        toast.success('Chamado Editado com sucesso!');
        setCustomerSelected(0);
        setComplemento('');
        setTimeout(() => {
          history.push('/chamados');
        }, 2000)
      }catch(err){
        toast.error('Ops erro ao registrar, tente mais tarde.')
        logError('New:update', err);
        setLoading(false);
      }

      return;
    }

    try{
      const docRef = await createChamado({
        created: new Date(),
        cliente: clienteAtual.nomeFantasia,
        clienteId: clienteAtual.id,
        assunto: assunto,
        prioridade: prioridade,
        status: status,
        complemento: complemento,
        userId: user.uid,
        finalizadoEm: status === 'Finalizado' ? new Date() : null
      });

      await addInteracao(docRef.id, {
        tipo: 'status',
        texto: '',
        autorNome: user.nome,
        autorId: user.uid,
        statusDe: null,
        statusPara: status
      });

      toast.success('Chamado criado com sucesso!');
      setComplemento('');
      setCustomerSelected(0);
      setTimeout(() => {
        history.push('/chamados');
      }, 2000)
    }catch(err){
      toast.error('Ops erro ao registrar, tente mais tarde.')
      logError('New:create', err);
      setLoading(false);
    }


  }


  //Chamado quando troca o assunto
  function handleChangeSelect(e){
    setAssunto(e.target.value);
  }

  //Chamado quando troca a prioridade
  function handleChangePrioridade(e){
    setPrioridade(e.target.value);
  }


  //Chamado quando troca o status
  function handleOptionChange(e){
    setStatus(e.target.value);
  }

  //Chamado quando troca de cliente
  function handleChangeCustomers(e){
    setCustomerSelected(e.target.value);
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Novo chamado">
          <FiPlusCircle size={25}  />
        </Title>

        <div className="container">

          <form className="form-profile"  onSubmit={handleRegister} >

            <label>Cliente</label>

            {loadCustomers ? (
              <input type="text" disabled={true} value="Carregando clientes..." />
            ) : (
                <select value={customerSelected} onChange={handleChangeCustomers} >
                {customers.map((item, index) => {
                  return(
                    <option key={item.id} value={index} >
                      {item.nomeFantasia}
                    </option>
                  )
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita Tecnica">Visita Técnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <label>Prioridade</label>
            <select value={prioridade} onChange={handleChangePrioridade}>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>

            {idCustomer && (
              <>
                <label>Status</label>
                <div className="status">
                  <input
                  type="radio"
                  name="radio"
                  value="Aberto"
                  onChange={handleOptionChange}
                  checked={ status === 'Aberto' }
                  />
                  <span>Aberto</span>

                  <input
                  type="radio"
                  name="radio"
                  value="Em Atendimento"
                  onChange={handleOptionChange}
                  checked={ status === 'Em Atendimento' }
                  />
                  <span>Em Atendimento</span>

                  <input
                  type="radio"
                  name="radio"
                  value="Finalizado"
                  onChange={handleOptionChange}
                  checked={ status === 'Finalizado' }
                  />
                  <span>Finalizado</span>
                </div>
                <br/>
              </>
            )}
            <label>Descrição</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema."
              required
              maxLength={500}
              value={complemento}
              onChange={ (e) => setComplemento(e.target.value) }
            />
            <small className="char-count">{complemento.length}/500 caracteres</small>

            <div className="form-botoes">
              <Link to="/chamados" className="btn-form btn-secundario">
                <FiArrowLeft size={18} />
                Voltar
              </Link>

              <button type="submit" className="btn-form btn-primario" disabled={loading}>
                <FiSave size={18} />
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  )
}
