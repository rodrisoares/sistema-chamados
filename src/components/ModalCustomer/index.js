
import '../Modal/modal.css';

import { FiX, FiEdit2 } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';
import { maskCNPJ } from '../../utils/cnpj';


export default function ModalCustomer({conteudo, close}){
  const history = useHistory();

  return(
    <div className="modal" onClick={close}>
      <div className="container" onClick={ (e) => e.stopPropagation() }>
        <button className="close" onClick={ close }>
          <FiX size={23} color="#FFF" />
          Fechar
        </button>

        <div>
          <h2>Detalhes da empresa</h2>

          <div className="row">
            <span>
              Empresa: <i>{conteudo.nomeFantasia}</i>
            </span>
          </div>

          <div className="row">
            <span>
              CNPJ: <i>{maskCNPJ(conteudo.cnpj)}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Endereço: <i>{conteudo.endereco || 'Não informado'}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Telefone: <i>{conteudo.telefone || 'Não informado'}</i>
            </span>
          </div>

          <div className="row">
            <span>
              E-mail: <i>{conteudo.emailContato || 'Não informado'}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Responsável: <i>{conteudo.responsavel || 'Não informado'}</i>
            </span>
          </div>

          <div className="modal-actions">
            <button className="btn-edit" onClick={ () => history.push(`/customers/${conteudo.id}/edit`) }>
              <FiEdit2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Editar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
