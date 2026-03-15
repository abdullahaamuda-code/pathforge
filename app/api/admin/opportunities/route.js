import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snap = await adminDb.collection("opportunities").orderBy("scrapedAt", "desc").get();
    const opportunities = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return Response.json({ opportunities });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("opportunities").doc(id).delete();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, data } = await request.json();
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("opportunities").doc(id).update(data);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
