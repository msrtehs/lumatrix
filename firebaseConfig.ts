
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Nota: Em um ambiente de produção real, estas chaves viriam de variáveis de ambiente seguras.
// Para este projeto, assumimos que o Firebase está configurado para aceitar conexões.
const firebaseConfig = {
  apiKey: "AIzaSyCo2WPcb5qy7JiDN8B5_O8SVhgXSjB_ocg",
  authDomain: "terranova-aea47.firebaseapp.com",
  projectId: "terranova-aea47",
  storageBucket: "terranova-aea47.firebasestorage.app",
  messagingSenderId: "324463663026",
  appId: "1:324463663026:web:129ffe275c20c9bbae76ab",
  measurementId: "G-9YT28Z9ZPW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
