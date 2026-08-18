import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/services/firebaseConnection';

const COLLECTION = 'customers';

function customersRef(){
  return collection(db, COLLECTION);
}

export async function getCustomers(){
  const snapshot = await getDocs(customersRef());
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCustomer(id){
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function createCustomer(data){
  return addDoc(customersRef(), data);
}

export function updateCustomer(id, data){
  return updateDoc(doc(db, COLLECTION, id), data);
}

export function deleteCustomer(id){
  return deleteDoc(doc(db, COLLECTION, id));
}
