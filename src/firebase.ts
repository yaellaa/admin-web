import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const storage = getStorage(app)

export async function findUserByEmail(email: string) {
  const usersRef = ref(db, 'Users')
  const q = query(usersRef, orderByChild('email'), equalTo(email))
  const snapshot = await get(q)
  if (!snapshot.exists()) return null

  let result: { id: string | null; [key: string]: any } | null = null
  snapshot.forEach((child) => {
    result = { id: child.key, ...child.val() }
    // stop after first match
    return true
  })

  return result
}

export { db, storage }
