import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebaseConnection';

const COLLECTION = 'users';

// Retorna o perfil do usuário (ou null se não existir).
export async function getUserProfile(uid){
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function createUserProfile(uid, data){
  return setDoc(doc(db, COLLECTION, uid), data);
}

export function updateUserProfile(uid, data){
  return updateDoc(doc(db, COLLECTION, uid), data);
}

export function deleteUserProfile(uid){
  return deleteDoc(doc(db, COLLECTION, uid));
}
