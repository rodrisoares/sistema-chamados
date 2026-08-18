import { useContext, useState, useEffect } from 'react';
import './header.css';
import { AuthContext } from '@/contexts/auth';
import ModalConfirm from '@/components/ModalConfirm';
import { updateUserProfile } from '@/services/usersService';
import { logError } from '@/utils/logError';
import avatar from '@/assets/avatar.png';

import { NavLink } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";


export default function Header(){
  const { user, setUser, storageUser, signOut } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Aplica a preferência de tema salva no perfil (sincroniza entre dispositivos)
  useEffect(()=>{
    if(user && user.tema && user.tema !== theme){
      setTheme(user.tema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user && user.tema]);

  function toggleTheme(){
    const novo = theme === 'dark' ? 'light' : 'dark';
    setTheme(novo);

    // Persiste a preferência no perfil do usuário
    if(user && user.uid){
      updateUserProfile(user.uid, { tema: novo })
        .catch((err)=> logError('toggleTheme', err));

      const data = { ...user, tema: novo };
      setUser(data);
      storageUser(data);
    }
  }

  function closeMenu(){
    setOpen(false);
  }

  return(
    <>
      <button className="menu-toggle" onClick={ () => setOpen(!open) } aria-label="Abrir menu">
        { open ? <FiX color="#FFF" size={26} /> : <FiMenu color="#FFF" size={26} /> }
      </button>

      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div>
          <img src={user.avatarUrl ? user.avatarUrl : avatar } alt="Foto avatar" />
        </div>

        <NavLink to="/chamados" activeClassName="active" onClick={closeMenu}>
          <FiHome color="#FFF" size={24} />
          Chamados
        </NavLink>
        <NavLink to="/customers" activeClassName="active" onClick={closeMenu}>
          <FiUser color="#FFF" size={24} />
          Clientes
        </NavLink>
        <NavLink to="/profile" activeClassName="active" onClick={closeMenu}>
          <FiSettings color="#FFF" size={24} />
          Meu Perfil
        </NavLink>

        <button className="theme-btn" onClick={toggleTheme}>
          { theme === 'dark' ? <FiSun color="#FFF" size={22} /> : <FiMoon color="#FFF" size={22} /> }
          <span className="name-btn">{ theme === 'dark' ? 'Tema claro' : 'Tema escuro' }</span>
        </button>

        <button className="logout-btn" onClick={ () => setShowLogout(true) }>
          <FiLogOut color="#FFF" size={24} />
          <span className="name-btn">
            Sair
          </span>
        </button>
      </div>

      {showLogout && (
        <ModalConfirm
          titulo="Sair da conta"
          mensagem="Tem certeza que deseja sair?"
          textoConfirmar="Sair"
          onConfirm={ () => { setShowLogout(false); signOut(); } }
          onCancel={ () => setShowLogout(false) }
        />
      )}
    </>
  )
}
