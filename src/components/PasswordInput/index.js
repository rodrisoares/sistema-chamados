
import { useState } from 'react';
import './passwordinput.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Campo de senha com botão de olho para exibir/ocultar o valor digitado.
// Repassa qualquer prop (value, onChange, placeholder, etc.) para o <input>.
export default function PasswordInput({ ...rest }){
  const [show, setShow] = useState(false);

  return(
    <div className="password-field">
      <input type={ show ? 'text' : 'password' } {...rest} />
      <button
        type="button"
        className="toggle-eye"
        onClick={ () => setShow(s => !s) }
        aria-label={ show ? 'Ocultar senha' : 'Mostrar senha' }
        tabIndex={-1}
      >
        { show ? <FiEyeOff size={18} /> : <FiEye size={18} /> }
      </button>
    </div>
  )
}
