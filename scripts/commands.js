// Import the functions you need from the SDKs you need
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { app } from "../FirebaseConfig.ts";
const db = getFirestore(app);
const auth = getAuth();
const user = auth.currentUser;
if (user !== null) {
  // The user object has basic properties such as display name, email, etc.
  const displayName = user.displayName;
  const email = user.email;
  const photoURL = user.photoURL;
  const emailVerified = user.emailVerified;

  // The user's ID, unique to the Firebase project. Do NOT use
  // this value to authenticate with your backend server, if
  // you have one. Use User.getToken() instead.
  const uid = user.uid;
  const grantsSnap = await db
    .collection("grants")
    .where("degreeLevel", "array-contains", user.degreeLevel)
    .where("school", "array-contains", user.school)
    .get();
}
console.log("API Key:", process.env.GEMINI_API_KEY); // Should log the actual key

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592

// expects an array for data to add
const addListOfGrants = async (source, vals) => {
  for (let i = 0; i < vals.length; i++) {
    await setDoc(doc(db, "grants", `source${i}`), data);
  }
};

// takes in output from a swipe, and then queries our database to showcase
// relevant grants.
const grantsRef = query(collection(db, "grants"));
const aiQueryGrants = async () => {
  const grantsRef = collection(db, "grants");
  const snapshot = await getDocs(grantsRef);
  const validGrants = [];
  const human = await getDocs(collection(db, "users"));
  human.forEach(async (guy) => {
    snapshot.forEach(async (doc) => {
      const prompt = `The user is ${JSON.stringify(guy.data(), null, 2)}.
  Based on this, examine whether the following grant is applicable. Output either yes if it fits this requirement, no if it does not, or other if the requirement isn't relevant to this grant.
   Grant: ${JSON.stringify(doc.data(), null, 2)}`;
      const genAIResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      console.log("GEN AI RESPONSE: " + genAIResponse.text);
      if (genAIResponse.text != "no") {
        validGrants.push([guy.id, doc.id]);
      }
    });

    console.log("Valid Grants:", validGrants);
    for (let i = 0; i < validGrants.length; i++) {
      addDoc(collection(db, "paired"), {
        userid: validGrants[i][0],
        grantid: validGrants[i][1],
      });
    }
  });
};

aiQueryGrants();

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
// await setDoc(doc(db, "grants", "mock-write-03"), data)
