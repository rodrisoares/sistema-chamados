import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { auth } from '@/services/firebaseConnection';

// Observa mudanças de sessão (login, logout, expiração de token).
// Retorna a função de "unsubscribe".
export function observeAuth(callback){
  return onAuthStateChanged(auth, callback);
}

export function login(email, password){
  return signInWithEmailAndPassword(auth, email, password);
}

export function register(email, password){
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logout(){
  return fbSignOut(auth);
}

export function getCurrentUser(){
  return auth.currentUser;
}

// Reautentica o usuário atual (exigido antes de operações sensíveis
// como trocar senha ou excluir a conta).
export function reauthenticate(email, senhaAtual){
  const credential = EmailAuthProvider.credential(email, senhaAtual);
  return reauthenticateWithCredential(auth.currentUser, credential);
}

export function changePassword(novaSenha){
  return updatePassword(auth.currentUser, novaSenha);
}

export function deleteAuthUser(){
  return deleteUser(auth.currentUser);
}
