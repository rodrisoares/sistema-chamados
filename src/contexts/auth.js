import { useState, createContext, useEffect } from 'react';
import { toast } from 'react-toastify';

import { observeAuth, login, register, logout } from '@/services/authService';
import { getUserProfile, createUserProfile } from '@/services/usersService';
import { logError } from '@/utils/logError';

export const AuthContext = createContext({});

// Traduz os códigos de erro do Firebase Auth em mensagens amigáveis
function mensagemErroAuth(error){
  switch(error?.code){
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/user-disabled':
      return 'Esta conta está desativada.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';
    default:
      return 'Ops algo deu errado!';
  }
}

function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // 1) UI instantânea a partir do localStorage (evita flash ao recarregar)
    function loadStorage(){
      const savedUser = localStorage.getItem('SistemaUser');

      if(savedUser){
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    }

    loadStorage();

    // 2) Firebase como fonte de verdade: detecta expiração de token / logout
    //    e mantém o perfil sincronizado.
    const unsubscribe = observeAuth(async (currentUser) => {
      if(currentUser){
        try{
          const perfil = await getUserProfile(currentUser.uid);

          if(perfil){
            const data = {
              uid: currentUser.uid,
              nome: perfil.nome,
              avatarUrl: perfil.avatarUrl || null,
              email: currentUser.email,
              tema: perfil.tema || 'light'
            };
            setUser(data);
            storageUser(data);
          }
        }catch(err){
          logError('AuthProvider:sync', err);
        }
      }else{
        // Sem sessão válida no Firebase: limpa qualquer estado remanescente
        if(localStorage.getItem('SistemaUser')){
          localStorage.removeItem('SistemaUser');
          setUser(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();

  }, []);


  //Fazendo login do usuario
  async function signIn(email, password){
    setLoadingAuth(true);
    try{
      const value = await login(email, password);
      const uid = value.user.uid;

      const perfil = await getUserProfile(uid);

      const data = {
        uid: uid,
        nome: perfil?.nome,
        avatarUrl: perfil?.avatarUrl || null,
        email: value.user.email,
        tema: perfil?.tema || 'light'
      };

      setUser(data);
      storageUser(data);
      toast.success('Bem vindo de volta!');
    }catch(error){
      logError('signIn', error);
      toast.error(mensagemErroAuth(error));
    }finally{
      setLoadingAuth(false);
    }
  }


  //Cadastrando um novo usuario
  async function signUp(email, password, nome){
    setLoadingAuth(true);
    try{
      const value = await register(email, password);
      const uid = value.user.uid;

      await createUserProfile(uid, {
        nome: nome,
        avatarUrl: null,
        tema: 'light'
      });

      const data = {
        uid: uid,
        nome: nome,
        email: value.user.email,
        avatarUrl: null,
        tema: 'light'
      };

      setUser(data);
      storageUser(data);
      toast.success('Bem vindo a plataforma!');
    }catch(error){
      logError('signUp', error);
      toast.error(mensagemErroAuth(error));
    }finally{
      setLoadingAuth(false);
    }
  }


  function storageUser(data){
    localStorage.setItem('SistemaUser', JSON.stringify(data));
  }


  //Logout do usuario
  async function signOut(){
    await logout();
    localStorage.removeItem('SistemaUser');
    setUser(null);
  }


  return(
    <AuthContext.Provider
    value={{
      signed: !!user,
      user,
      loading,
      signUp,
      signOut,
      signIn,
      loadingAuth,
      setUser,
      storageUser
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;
