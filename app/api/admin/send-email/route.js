export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { subject, message, targetStage, targetAll, targetUids } = await request.json();

    if (!subject || !message) {
      return Response.json({ error: "Missing subject or message" }, { status: 400 });
    }

    // Get target users
    let usersQuery = adminDb.collection("users");
    const snap = await usersQuery.get();
    let users = snap.docs.map((d) => d.data());

    if (targetUids && targetUids.length > 0) {
      users = users.filter((u) => targetUids.includes(u.uid));
    } else if (!targetAll && targetStage) {
      users = users.filter((u) => u.stage === targetStage);
    }

    const emails = users.map((u) => ({ email: u.email, name: u.name })).filter((u) => u.email);

    if (!emails.length) {
      return Response.json({ error: "No users found" }, { status: 400 });
    }

    // Send via Brevo
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "PathForge", email: "hello@pathforge.app" },
          to: batch,
          subject,
          htmlContent: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#080a0f;color:#fff;padding:40px;border-radius:12px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
                <div style="width:32px;height:32px;background:#7F77DD;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:white;font-size:14px;font-weight:bold;">P</span>
                </div>
                <span style="font-size:16px;font-weight:500;color:#fff;">PathForge</span>
              </div>
              <div style="color:#B4B2A9;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message}</div>
              <div style="margin-top:40px;padding-top:20px;border-top:1px solid #2C2C2A;font-size:12px;color:#444441;">
                You're receiving this because you signed up for PathForge.
                <a href="https://pathforge-inky.vercel.app" style="color:#7F77DD;">Visit PathForge</a>
              </div>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
      sent += batch.length;
    }

    return Response.json({ success: true, sent });
  } catch (err) {
    console.error("Email error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
