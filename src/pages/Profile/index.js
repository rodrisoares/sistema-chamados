import { useState, useEffect, useContext } from 'react';
import './profile.css';
import Header from '@/components/Header';
import Title from '@/components/Title';
import ModalConfirm from '@/components/ModalConfirm';
import PasswordInput from '@/components/PasswordInput';
import avatar from '@/assets/avatar.png';

import { getCurrentUser, reauthenticate, changePassword, deleteAuthUser } from '@/services/authService';
import { updateUserProfile, deleteUserProfile } from '@/services/usersService';
import { uploadAvatar } from '@/services/storageService';
import { AuthContext } from '@/contexts/auth';
import { logError } from '@/utils/logError';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

import { FiSettings, FiUpload, FiLock, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

export default function Profile(){
  const { user, setUser, storageUser } = useContext(AuthContext);

  const [nome, setNome] = useState(user && user.nome);
  const [email] = useState(user && user.email);

  const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
  const [imageAvatar, setImageAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [membroDesde, setMembroDesde] = useState('');
  const [ultimoAcesso, setUltimoAcesso] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [senhaExcluir, setSenhaExcluir] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);


  // Datas da conta (metadata do Firebase Auth)
  useEffect(()=>{
    const cur = getCurrentUser();
    if(cur && cur.metadata){
      if(cur.metadata.creationTime){
        setMembroDesde(format(new Date(cur.metadata.creationTime), 'dd/MM/yyyy'));
      }
      if(cur.metadata.lastSignInTime){
        setUltimoAcesso(format(new Date(cur.metadata.lastSignInTime), "dd/MM/yyyy 'às' HH:mm"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  function handleFile(e){
    if(e.target.files[0]){
      const image = e.target.files[0];

      if(image.type !== 'image/jpeg' && image.type !== 'image/png'){
        toast.error('Envie uma imagem do tipo PNG ou JPEG');
        setImageAvatar(null);
        return;
      }

      if(image.size > MAX_AVATAR_BYTES){
        toast.error('A imagem deve ter no máximo 2MB.');
        setImageAvatar(null);
        return;
      }

      setImageAvatar(image);
      setAvatarUrl(URL.createObjectURL(image));
    }
  }

  async function handleUpload(){
    const url = await uploadAvatar(user.uid, imageAvatar, setUploadProgress);

    await updateUserProfile(user.uid, { avatarUrl: url, nome: nome });

    const data = { ...user, avatarUrl: url, nome: nome };
    setUser(data);
    storageUser(data);
  }


  async function handleSave(e){
    e.preventDefault();

    if(nome === ''){
      toast.warn('O nome não pode ficar vazio.');
      return;
    }

    setSaving(true);
    try{
      if(imageAvatar === null){
        await updateUserProfile(user.uid, { nome: nome });

        let data = { ...user, nome: nome };
        setUser(data);
        storageUser(data);
      }else{
        await handleUpload();
      }
      toast.success('Perfil atualizado com sucesso!');
    }catch(err){
      logError('Profile:save', err);
      toast.error('Erro ao salvar o perfil.');
    }finally{
      setSaving(false);
      setUploadProgress(0);
    }
  }


  async function handleRemoveAvatar(){
    if(!user.avatarUrl){
      return;
    }

    setSaving(true);
    try{
      await updateUserProfile(user.uid, { avatarUrl: null });

      const data = { ...user, avatarUrl: null };
      setUser(data);
      storageUser(data);
      setAvatarUrl(null);
      setImageAvatar(null);
      toast.success('Foto de perfil removida.');
    }catch(err){
      logError('Profile:removeAvatar', err);
      toast.error('Erro ao remover a foto.');
    }finally{
      setSaving(false);
    }
  }


  async function handleChangePassword(e){
    e.preventDefault();

    if(senhaAtual === '' || novaSenha === ''){
      toast.warn('Preencha a senha atual e a nova senha.');
      return;
    }

    if(novaSenha.length < 6){
      toast.warn('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setChangingPassword(true);
    try{
      await reauthenticate(user.email, senhaAtual);
      await changePassword(novaSenha);

      toast.success('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
    }catch(err){
      logError('Profile:changePassword', err);
      if(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'){
        toast.error('Senha atual incorreta.');
      }else if(err.code === 'auth/too-many-requests'){
        toast.error('Muitas tentativas. Tente novamente mais tarde.');
      }else{
        toast.error('Não foi possível alterar a senha.');
      }
    }finally{
      setChangingPassword(false);
    }
  }


  function handleAskDeleteAccount(e){
    e.preventDefault();
    if(senhaExcluir === ''){
      toast.warn('Digite sua senha para confirmar a exclusão.');
      return;
    }
    setShowDeleteConfirm(true);
  }

  async function handleDeleteAccount(){
    setShowDeleteConfirm(false);
    setDeletingAccount(true);
    try{
      await reauthenticate(user.email, senhaExcluir);

      // Remove o perfil no Firestore e a conta de autenticação
      await deleteUserProfile(user.uid);
      await deleteAuthUser();

      toast.success('Conta excluída. Sentiremos sua falta!');
      // O onAuthStateChanged cuida do logout e do redirecionamento
    }catch(err){
      logError('Profile:deleteAccount', err);
      if(err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'){
        toast.error('Senha incorreta.');
      }else if(err.code === 'auth/too-many-requests'){
        toast.error('Muitas tentativas. Tente novamente mais tarde.');
      }else{
        toast.error('Não foi possível excluir a conta.');
      }
      setDeletingAccount(false);
    }
  }


  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Meu perfil">
          <FiSettings size={25} />
        </Title>

        <div className="perfil-grid">

          {/* Coluna esquerda: cartão-resumo */}
          <aside className="perfil-card perfil-resumo">
            <label className="label-avatar">
              <span>
                <FiUpload color="#FFF" size={22} />
              </span>

              <input type="file" accept="image/*" onChange={handleFile} />
              { avatarUrl ?
                <img src={avatarUrl} alt="Foto de perfil do usuario" />
                :
                <img src={avatar} alt="Foto de perfil do usuario" />
              }

              { saving && (
                <div className="avatar-overlay">
                  { uploadProgress > 0 ? (
                    <div className="upload-progress">
                      <div className="upload-bar" style={{ width: `${uploadProgress}%` }} />
                      <span>{uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="spinner" />
                  )}
                </div>
              )}
            </label>

            { avatarUrl && (
              <button type="button" className="btn-remove-avatar" onClick={handleRemoveAvatar} disabled={saving}>
                <FiXCircle size={16} /> Remover foto
              </button>
            )}

            <h2 className="perfil-nome">{nome}</h2>
            <span className="perfil-email">{email}</span>

            { (membroDesde || ultimoAcesso) && (
              <div className="perfil-meta">
                { membroDesde && (
                  <div className="meta-item">
                    <small>Membro desde</small>
                    <b>{membroDesde}</b>
                  </div>
                )}
                { ultimoAcesso && (
                  <div className="meta-item">
                    <small>Último acesso</small>
                    <b>{ultimoAcesso}</b>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* Coluna direita: formulários */}
          <div className="perfil-forms">

            <section className="perfil-card">
              <h3 className="card-header"><FiSettings size={18} /> Editar perfil</h3>
              <form className="form-profile" onSubmit={handleSave}>
                <label>Nome</label>
                <input type="text" value={nome} onChange={ (e) => setNome(e.target.value) } />

                <label>Email</label>
                <input type="text" value={email} disabled={true} />

                <div className="form-actions">
                  <button type="submit" disabled={saving}>{ saving ? 'Salvando...' : 'Salvar' }</button>
                </div>
              </form>
            </section>

            <section className="perfil-card">
              <h3 className="card-header"><FiLock size={18} /> Alterar senha</h3>
              <form className="form-profile" onSubmit={handleChangePassword}>
                <label>Senha atual</label>
                <PasswordInput
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={ (e) => setSenhaAtual(e.target.value) }
                />

                <label>Nova senha</label>
                <PasswordInput
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  value={novaSenha}
                  onChange={ (e) => setNovaSenha(e.target.value) }
                />

                <div className="form-actions">
                  <button type="submit" disabled={changingPassword}>{ changingPassword ? 'Alterando...' : 'Alterar senha' }</button>
                </div>
              </form>
            </section>

            {/* Zona de perigo */}
            <section className="perfil-card perfil-danger">
              <h3 className="card-header"><FiAlertTriangle size={18} /> Excluir conta</h3>
              <form className="form-profile" onSubmit={handleAskDeleteAccount}>
                <p className="danger-text">
                  Esta ação é permanente e não pode ser desfeita. Confirme sua senha para excluir sua conta.
                </p>

                <label>Senha</label>
                <PasswordInput
                  placeholder="Digite sua senha para confirmar"
                  value={senhaExcluir}
                  onChange={ (e) => setSenhaExcluir(e.target.value) }
                />

                <div className="form-actions">
                  <button type="submit" className="btn-danger" disabled={deletingAccount}>
                    { deletingAccount ? 'Excluindo...' : 'Excluir minha conta' }
                  </button>
                </div>
              </form>
            </section>

          </div>
        </div>

      </div>

      {showDeleteConfirm && (
        <ModalConfirm
          titulo="Excluir conta"
          mensagem="Tem certeza que deseja excluir sua conta permanentemente? Todos os seus dados de acesso serão removidos."
          textoConfirmar="Excluir conta"
          onConfirm={handleDeleteAccount}
          onCancel={ () => setShowDeleteConfirm(false) }
        />
      )}
    </div>
  )
}
