import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = { projectId: "ai-studio-freshayamdirect-15505cfe-5a88-4e35-aa9b-34e5a14f1661" }; // fake config for local emulator maybe? 
// Actually we can't easily query firestore from node without admin SDK or proper config.
