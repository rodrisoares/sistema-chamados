import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/services/firebaseConnection';

// Faz upload do avatar acompanhando o progresso.
// onProgress recebe a porcentagem (0-100). Resolve com a URL de download.
export function uploadAvatar(uid, file, onProgress){
  const storageRef = ref(storage, `images/${uid}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        if(onProgress) onProgress(pct);
      },
      (err) => reject(err),
      async () => {
        try{
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }catch(err){
          reject(err);
        }
      }
    );
  });
}
