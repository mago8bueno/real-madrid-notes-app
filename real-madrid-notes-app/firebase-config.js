// Configuración de Firebase
// INSTRUCCIONES PARA CONFIGURAR FIREBASE:
// 1. Ve a https://console.firebase.google.com/
// 2. Haz clic en "Crear un proyecto" o "Add project"
// 3. Nombra tu proyecto (ej: "real-madrid-notes")
// 4. Desactiva Google Analytics (no es necesario para este proyecto)
// 5. Una vez creado el proyecto, ve a "Project Settings" (icono de engranaje)
// 6. En la pestaña "General", baja hasta "Your apps" y haz clic en el icono web (</>)
// 7. Registra tu app con un nombre (ej: "Real Madrid Notes Web")
// 8. Copia la configuración que te proporciona Firebase y reemplaza los valores de abajo
// 9. Ve a "Firestore Database" en el menú lateral
// 10. Haz clic en "Create database"
// 11. Selecciona "Start in test mode" (para desarrollo)
// 12. Elige una ubicación cercana (ej: europe-west3)

// REEMPLAZA ESTOS VALORES CON TU CONFIGURACIÓN DE FIREBASE:
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

// Inicialización de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar funciones para usar en otros archivos
window.db = db;
window.firestore = { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where };

