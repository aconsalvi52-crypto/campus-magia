import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8s_8K3dYyX1Gc1hp6BR-Nqv7hQnsAXuw",
  authDomain: "eaam-campus.firebaseapp.com",
  projectId: "eaam-campus",
  storageBucket: "eaam-campus.firebasestorage.app",
  messagingSenderId: "149994513026",
  appId: "1:149994513026:web:a982d8f61c7fdb29594a9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Zero-Trace Rule: Session persistence only. Wipes on tab close.
setPersistence(auth, browserSessionPersistence);

export { auth, db, storage };
