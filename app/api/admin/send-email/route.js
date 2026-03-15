import { Resend } from "resend";
import { adminDb } from "@/lib/firebaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { subject, message, targetStage, targetAll } = await request.json();

    if (!subject || !message) {
      return Response.json({ error: "Missing subject or message" }, { status: 400 });
    }

    // Get target users
    let query = adminDb.collection("users");
    if (!targetAll && targetStage) {
      query = query.where("stage", "==", targetStage);
    }
    const snap = await query.get();
    const emails = snap.docs.map((d) => d.data().email).filter(Boolean);

    if (!emails.length) {
      return Response.json({ error: "No users found" }, { status: 400 });
    }

    // Send in batches of 50
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await resend.emails.send({
        from: "PathForge <hello@pathforge.app>",
        to: batch,
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #080a0f; color: #fff; padding: 40px; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
              <div style="width: 32px; height: 32px; background: #7F77DD; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 16px; font-weight: bold;">P</span>
              </div>
              <span style="font-size: 16px; font-weight: 500; color: #fff;">PathForge</span>
            </div>
            <div style="color: #B4B2A9; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${message}</div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #2C2C2A; font-size: 12px; color: #444441;">
              You're receiving this because you signed up for PathForge.
              <a href="https://pathforge-inky.vercel.app" style="color: #7F77DD;">Visit PathForge</a>
            </div>
          </div>
        `,
      });
      sent += batch.length;
    }

    return Response.json({ success: true, sent });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
