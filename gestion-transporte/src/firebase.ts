import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsFCfIo9vfyT3yQcYtNCV4EZq5GsSUp-g",
  authDomain: "proyecto-final-65eaf.firebaseapp.com",
  projectId: "proyecto-final-65eaf",
  storageBucket: "proyecto-final-65eaf.firebasestorage.app",
  messagingSenderId: "82557473304",
  appId: "1:82557473304:web:5848c254937b259767e96d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
};

export const logout = async () => {
  await signOut(auth);
};
