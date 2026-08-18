import { useState, useEffect } from 'react';
import './customers.css';
import Title from '@/components/Title';
import Header from '@/components/Header';
import ModalCustomer from '@/components/ModalCustomer';
import ModalConfirm from '@/components/ModalConfirm';
import { deleteCustomer } from '@/services/customersService';
import { clienteTemChamados } from '@/services/chamadosService';
import { useCustomers } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { logError } from '@/utils/logError';
import { FiUser, FiSearch, FiEdit2, FiTrash2, FiPlus, FiMessageSquare } from 'react-icons/fi';

import { toast } from 'react-toastify';
import { Link, useHistory } from 'react-router-dom';

const PAGE_SIZE = 8;

export default function Customers(){
  const history = useHistory();

  const { customers, setCustomers, contagens, loading: loadCustomers } = useCustomers();

  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 300);

  const [sortField, setSortField] = useState('nomeFantasia');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState();

  const [deleteId, setDeleteId] = useState(null);
  const [checkingDelete, setCheckingDelete] = useState(false);

  // Volta para a primeira página quando muda a busca ou a ordenação
  useEffect(()=>{
    setPage(1);
  }, [searchDebounced, sortField, sortDir]);

  function qtdDe(id){
    return contagens[id] || { total: 0, abertos: 0 };
  }

  const filtered = customers.filter((item) => {
    const termo = searchDebounced.trim().toLowerCase();
    if(termo === '') return true;
    return (
      (item.nomeFantasia || '').toLowerCase().includes(termo) ||
      (item.cnpj || '').toLowerCase().includes(termo)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch(sortField){
      case 'cnpj':      cmp = (a.cnpj || '').localeCompare(b.cnpj || ''); break;
      case 'chamados':  cmp = qtdDe(a.id).total - qtdDe(b.id).total; break;
      case 'nomeFantasia':
      default:          cmp = (a.nomeFantasia || '').localeCompare(b.nomeFantasia || ''); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = sorted.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function handleSort(field){
    if(sortField === field){
      setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');
    }else{
      setSortField(field);
      setSortDir('asc');
    }
  }

  function setaSort(field){
    if(sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  // Antes de abrir o diálogo, verifica se há chamados vinculados ao cliente
  async function handleAskDelete(idDelete){
    setCheckingDelete(true);
    try{
      const temChamados = await clienteTemChamados(idDelete);

      if(temChamados){
        toast.warn('Este cliente possui chamados vinculados e não pode ser excluído.');
        return;
      }

      setDeleteId(idDelete);
    }catch(error){
      logError('Customers:askDelete', error);
      toast.error('Erro ao verificar os chamados do cliente.');
    }finally{
      setCheckingDelete(false);
    }
  }

  async function handleDelete(){
    const idDelete = deleteId;
    setDeleteId(null);

    try{
      await deleteCustomer(idDelete);
      toast.success('Empresa excluída com sucesso!');
      setCustomers(customers => customers.filter(item => item.id !== idDelete));
    }catch(error){
      logError('Customers:delete', error);
      toast.error('Erro ao excluir essa empresa.');
    }
  }

  function togglePostModal(item){
    setShowModal(!showModal);
    setDetail(item);
  }

  if(loadCustomers){
    return(
      <div>
        <Header/>

        <div className="content">
          <Title name="Clientes">
            <FiUser size={25} />
          </Title>

          <div className="container chamados">
            <span>Buscando clientes...</span>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        {customers.length === 0 ? (
          <div className="container chamados">
            <span>Nenhum cliente cadastrado...</span>

            <Link to="/customers/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo cliente
            </Link>
          </div>
        ) : (
          <>
            <Link to="/customers/new" className="new">
              <FiPlus size={25} color="#FFF" />
              Novo cliente
            </Link>

            <div className="search-customers">
              <FiSearch size={20} color="#999" />
              <input
                type="text"
                placeholder="Buscar por empresa ou CNPJ..."
                value={search}
                onChange={ (e) => setSearch(e.target.value) }
              />
            </div>

            {sorted.length === 0 ? (
              <div className="container chamados">
                <span>Nenhum cliente encontrado para "{search}".</span>
              </div>
            ) : (
            <>
            <table>
              <thead>
                <tr>
                  <th scope="col" className="th-sort" onClick={ () => handleSort('nomeFantasia') }>Empresa{setaSort('nomeFantasia')}</th>
                  <th scope="col" className="th-sort" onClick={ () => handleSort('cnpj') }>CNPJ{setaSort('cnpj')}</th>
                  <th scope="col">Endereço</th>
                  <th scope="col" className="th-sort" onClick={ () => handleSort('chamados') }>Chamados{setaSort('chamados')}</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const q = qtdDe(item.id);
                  return(
                    <tr key={item.id}>
                      <td data-label="Empresa">{item.nomeFantasia}</td>
                      <td data-label="CNPJ">{item.cnpj}</td>
                      <td data-label="Endereço">{item.endereco}</td>
                      <td data-label="Chamados">
                        {q.total > 0 ? (
                          <button
                            className="link-chamados"
                            title="Ver chamados deste cliente"
                            onClick={ () => history.push(`/chamados?cliente=${item.id}`) }
                          >
                            <FiMessageSquare size={14} />
                            {q.total} <small>({q.abertos} em aberto)</small>
                          </button>
                        ) : (
                          <span className="sem-chamados">—</span>
                        )}
                      </td>
                      <td data-label="Ações">
                        <button className="action-customers" style={{backgroundColor: '#3583f6' }} onClick={ () => togglePostModal(item) }>
                          <FiSearch color="#FFF" size={17} />
                        </button>
                        <button className="action-customers" style={{backgroundColor: '#F6a935' }} onClick={ () => history.push(`/customers/${item.id}/edit`) }>
                          <FiEdit2 color="#FFF" size={17} />
                        </button>
                        <button className="action-customers" style={{backgroundColor: '#ff0000' }} disabled={checkingDelete} onClick={ () => handleAskDelete(item.id) }>
                          <FiTrash2 color="#FFF" size={17} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="paginacao">
                <button disabled={pageSafe <= 1} onClick={ () => setPage(p => p - 1) }>Anterior</button>
                <span>Página {pageSafe} de {totalPages}</span>
                <button disabled={pageSafe >= totalPages} onClick={ () => setPage(p => p + 1) }>Próxima</button>
              </div>
            )}
            </>
            )}
          </>
        )}

      </div>

      {showModal && (
        <ModalCustomer
          conteudo={detail}
          close={togglePostModal}
        />
      )}

      {deleteId && (
        <ModalConfirm
          titulo="Excluir cliente"
          mensagem="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
          textoConfirmar="Excluir"
          onConfirm={handleDelete}
          onCancel={ () => setDeleteId(null) }
        />
      )}

    </div>
  )
}
