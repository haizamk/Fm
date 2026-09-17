import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const firebaseConfig = { 
  projectId: config.projectId, 
  apiKey: config.apiKey, 
  authDomain: config.authDomain 
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clearOrders() {
  const querySnapshot = await getDocs(collection(db, "orders"));
  console.log(`Found ${querySnapshot.size} orders to delete.`);
  for (const docSnap of querySnapshot.docs) {
    await deleteDoc(doc(db, "orders", docSnap.id));
    console.log(`Deleted order ${docSnap.id}`);
  }
  console.log("All orders deleted from Firestore.");
  process.exit(0);
}
clearOrders().catch(console.error);
