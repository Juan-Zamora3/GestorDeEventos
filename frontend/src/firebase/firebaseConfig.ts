// Inicialización básica de Firebase para tu Gestor de Eventos

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// (Opcional) Analytics solo en navegador
import { getAnalytics, isSupported } from "firebase/analytics";

// === CONFIGURACIÓN QUE ME PASASTE ===
const firebaseConfig = {
  apiKey: "AIzaSyD5XYXktEXkXBc_bGheeLzaWDp9jYoIu_4",
  authDomain: "gestoreventositspp.firebaseapp.com",
  databaseURL: "https://gestoreventositspp-default-rtdb.firebaseio.com",
  projectId: "gestoreventositspp",
  storageBucket: "gestoreventositspp.firebasestorage.app",
  messagingSenderId: "836067423932",
  appId: "1:836067423932:web:a45900e8f890d6a9b482b9",
  measurementId: "G-RJWDDK3VVX",
};

// Inicializamos la app SOLO UNA VEZ
const app = initializeApp(firebaseConfig);

// Servicios que vamos a usar como “backend”
export const db = getFirestore(app);   // Aquí van tus "tablas" -> colecciones
export const auth = getAuth(app);      // Para login con correo y/o proveedor institucional
export const storage = getStorage(app);// Para PDFs de constancias, imágenes, etc.

// Opcional: analytics, por si luego quieres métricas
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((ok) => {
  if (ok) {
    analytics = getAnalytics(app);
  }
});
