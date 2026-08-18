
import '../Modal/modal.css';

import { FiAlertTriangle } from 'react-icons/fi';

export default function ModalConfirm({ titulo, mensagem, textoConfirmar, onConfirm, onCancel }){
  return(
    <div className="modal" onClick={onCancel}>
      <div className="container" onClick={ (e) => e.stopPropagation() }>
        <div>
          <h2>
            <FiAlertTriangle size={26} color="#F65835" style={{ marginRight: 8, verticalAlign: 'middle' }} />
            { titulo || 'Confirmar exclusão' }
          </h2>

          <p>{ mensagem }</p>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
            <button className="btn-confirm" onClick={onConfirm}>{ textoConfirmar || 'Excluir' }</button>
          </div>
        </div>
      </div>
    </div>
  )
}
