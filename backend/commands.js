// Import the functions you need from the SDKs you need
import {
  collection,
  doc,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { app } from "../FirebaseConfig.ts";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const data = {
  name: "Los Angeles",
  state: "CA",
  country: "USA",
};
// expects an array for data to add
const addListOfGrants = async (source, vals) => {
  for (let i = 0; i < vals.length; i++) {
    await setDoc(doc(db, "grants", `source${i}`), data);
  }
};

// sample:
// params.field = region;
// params.expr = '=='
// params.target = 'Alberta'
const condListOfGrants = async (params) => {
  const field = params.field;
  const expr = params.expr;
  const target = params.target;
  const outcome = query(
    collection(db, "grants"),
    where(field, target, outcome),
  );
  return outcome;
};
// Add a new document in collection "cities" with ID 'LA'
await setDoc(doc(db, "grants", "mock-write-03"), data);
