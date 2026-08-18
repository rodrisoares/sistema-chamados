
import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import PasswordInput from '../../components/PasswordInput';

import logo from '../../assets/logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUp() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signUp, loadingAuth } = useContext(AuthContext);

  function handleSubmit(e){
    e.preventDefault();

    if(nome.trim() === '' || email.trim() === '' || password === ''){
      toast.warn('Preencha todos os campos.');
      return;
    }

    if(!EMAIL_REGEX.test(email.trim())){
      toast.warn('Digite um e-mail válido.');
      return;
    }

    if(password.length < 6){
      toast.warn('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    signUp(email.trim(), password, nome.trim());
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Sistema Logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Cadastrar uma conta</h1>
          <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input type="text" placeholder="email@email.com" value={email} onChange={ (e) => setEmail(e.target.value) }/>
          <PasswordInput placeholder="Senha (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value) } />
          <button type="submit" disabled={loadingAuth}>{loadingAuth ? 'Carregando...' : 'Cadastrar'}</button>
        </form>  

        <Link to="/">Já tem uma conta? Entre</Link>
      </div>
    </div>
  );
}

export default SignUp;
