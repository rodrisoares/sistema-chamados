import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/services/firebaseConnection';

const COLLECTION = 'chamados';

function chamadosRef(){
  return collection(db, COLLECTION);
}

function interacoesRef(chamadoId){
  return collection(db, COLLECTION, chamadoId, 'interacoes');
}

// Escuta em tempo real todos os chamados (mais recentes primeiro).
// Retorna a função de "unsubscribe".
export function subscribeChamados(onData, onError){
  const q = query(chamadosRef(), orderBy('created', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// Busca única de todos os chamados (para relatórios/contagens).
export async function getChamados(){
  const snapshot = await getDocs(chamadosRef());
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getChamado(id){
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function createChamado(data){
  return addDoc(chamadosRef(), data);
}

export function updateChamado(id, data){
  return updateDoc(doc(db, COLLECTION, id), data);
}

export function deleteChamado(id){
  return deleteDoc(doc(db, COLLECTION, id));
}

// Verifica se existe pelo menos um chamado vinculado ao cliente.
export async function clienteTemChamados(clienteId){
  const q = query(chamadosRef(), where('clienteId', '==', clienteId), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// --- Timeline de interações (subcoleção chamados/{id}/interacoes) ---

export function subscribeInteracoes(chamadoId, onData, onError){
  const q = query(interacoesRef(chamadoId), orderBy('created', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export function addInteracao(chamadoId, dados){
  return addDoc(interacoesRef(chamadoId), { created: new Date(), ...dados });
}
