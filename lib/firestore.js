import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Get a user's profile
export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Update a user's profile
export async function updateUser(uid, data) {
  await updateDoc(doc(db, "users", uid), data);
}

// Save a roadmap
export async function saveRoadmap(uid, roadmapData) {
  await setDoc(doc(db, "roadmaps", uid), {
    uid,
    ...roadmapData,
    generatedAt: serverTimestamp(),
  });
}

// Get a user's roadmap
export async function getRoadmap(uid) {
  const snap = await getDoc(doc(db, "roadmaps", uid));
  return snap.exists() ? snap.data() : null;
}

// Get all active opportunities
export async function getOpportunities() {
  const q = query(
    collection(db, "opportunities"),
    where("isActive", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Save an opportunity
export async function saveOpportunity(uid, opportunityId, extra = {}) {
  await addDoc(collection(db, "saved"), {
    uid,
    opportunityId,
    ...extra,
    reminderSent: false,
    savedAt: serverTimestamp(),
  });
}

// Get user's saved opportunities
export async function getSaved(uid) {
  const q = query(collection(db, "saved"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Log an event
export async function logEvent(uid, type, meta = {}) {
  await addDoc(collection(db, "events"), {
    uid,
    type,
    meta,
    timestamp: serverTimestamp(),
  });
}

// Submit feedback
export async function submitFeedback(uid, rating, message) {
  await addDoc(collection(db, "feedback"), {
    uid,
    rating,
    message,
    createdAt: serverTimestamp(),
  });
}

// Save scored opportunities for a user
export async function saveUserOpportunities(uid, opportunities) {
  await setDoc(doc(db, "userOpportunities", uid), {
    uid,
    opportunities,
    cachedAt: serverTimestamp(),
  });
}

// Get cached opportunities for a user
export async function getUserOpportunities(uid) {
  const snap = await getDoc(doc(db, "userOpportunities", uid));
  if (!snap.exists()) return null;
  const data = snap.data();

  // Check if cache is older than 24 hours
  const cachedAt = data.cachedAt?.toDate();
  if (!cachedAt) return null;
  const hoursSince = (Date.now() - cachedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSince > 24) return null;

  return data.opportunities;
}