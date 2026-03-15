import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        name: data.name,
        email: data.email,
        stage: data.stage,
        country: data.country,
        interests: data.interests,
        onboardingComplete: data.onboardingComplete,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });
    return Response.json({ users });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

    // Delete all user data
    const batch = adminDb.batch();
    batch.delete(adminDb.collection("users").doc(uid));
    batch.delete(adminDb.collection("roadmaps").doc(uid));
    batch.delete(adminDb.collection("userOpportunities").doc(uid));
    batch.delete(adminDb.collection("userJobs").doc(uid));
    await batch.commit();

    // Delete saved items
    const savedSnap = await adminDb.collection("saved").where("uid", "==", uid).get();
    const savedBatch = adminDb.batch();
    savedSnap.docs.forEach((doc) => savedBatch.delete(doc.ref));
    await savedBatch.commit();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
