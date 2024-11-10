// DataBase/Configuraciones.js

import "react-native-get-random-values"; // Importar esto primero
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANt1wfdm_0WkVVOyEl4mbGvZyAeUCM62A",
  authDomain: "reparaciones-34f66.firebaseapp.com",
  projectId: "reparaciones-34f66",
  storageBucket: "reparaciones-34f66.appspot.com",
  messagingSenderId: "572934588860",
  appId: "1:572934588860:web:f715d6e7bfaefb213e03b9",
  measurementId: "G-Q6TJF6PFKK",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
