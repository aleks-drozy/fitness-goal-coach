import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Cron auth guard
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find users with no progress entry in last 8 days
  const cutoff = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentUsers } = await supabase
    .from("progress_entries")
    .select("user_id")
    .gte("created_at", cutoff);

  const recentIds = (recentUsers ?? []).map((r: { user_id: string }) => r.user_id);

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id");

  const toRemind = (allProfiles ?? []).filter(
    (p: { id: string }) => !recentIds.includes(p.id)
  );

  if (toRemind.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get emails via admin API — paginate to handle >1000 users
  const users: { id: string; email?: string }[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    users.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
  }
  const remindEmails = users
    .filter((u) => toRemind.some((p: { id: string }) => p.id === u.id))
    .map((u) => u.email)
    .filter(Boolean) as string[];

  let sent = 0;
  for (const email of remindEmails) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Fitness Coach <noreply@yourdomain.com>",
        to: email,
        subject: "Time to log your weekly check-in 💪",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">How's the week going?</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
              You haven't logged a check-in this week. Even a quick note helps your AI coach track your trajectory and keep your plan on point.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/progress"
               style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Log this week →
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 32px;">
              You're receiving this because you have a Fitness Coach account.
            </p>
          </div>
        `,
      });
      sent++;
    } catch {
      // continue on individual failures
    }
  }

  return NextResponse.json({ sent });
}
