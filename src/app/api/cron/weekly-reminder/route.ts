import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";
import { APP_NAME } from "@/lib/config";

export async function GET(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const cutoff = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentUsers } = await supabase
    .from("progress_entries")
    .select("user_id")
    .gte("created_at", cutoff);

  const recentIds = (recentUsers ?? []).map((r: { user_id: string }) => r.user_id);

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, wizard_state");

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

  const remindUsers = users
    .filter((u) => toRemind.some((p: { id: string }) => p.id === u.id))
    .map((u) => {
      const profile = toRemind.find((p: { id: string }) => p.id === u.id) as
        | { id: string; wizard_state?: Record<string, unknown> }
        | undefined;
      const ws = profile?.wizard_state;
      const cc = (ws?.competitionContext ?? {}) as Record<string, unknown>;
      const questionnaire = (ws?.questionnaire ?? {}) as Record<string, unknown>;
      const compDate = cc.competitionDate as string | null ?? null;
      const weightClass = cc.weightClass ?? null;
      const sport = (questionnaire.sport as string) ?? null;
      const daysToComp = compDate
        ? Math.round((new Date(compDate).getTime() - Date.now()) / 86_400_000)
        : null;
      return { email: u.email, daysToComp, weightClass, sport };
    })
    .filter((u): u is typeof u & { email: string } => !!u.email);

  let sent = 0;
  for (const user of remindUsers) {
    const { email, daysToComp, weightClass, sport } = user;
    const hasComp = daysToComp !== null && daysToComp > 0;
    const sportLabel = sport && sport !== "none" ? sport.toUpperCase() : null;

    const subject = hasComp
      ? `${daysToComp} days to your competition · log this week's check-in`
      : "Time to log your weekly check-in";

    const compLine = hasComp
      ? `<p style="color:#d97706;font-weight:600;margin-bottom:12px;">
          ${daysToComp} days to competition${weightClass ? ` · target: ${weightClass}kg` : ""}
         </p>`
      : "";

    const sportLine = sportLabel
      ? `<p style="color:#666;margin-bottom:8px;">Your ${sportLabel} S&amp;C is only as good as your recovery tracking.</p>`
      : "";

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:12px;">How's the week going?</h2>
        ${compLine}
        ${sportLine}
        <p style="color:#666;line-height:1.6;margin-bottom:24px;">
          You haven't logged a check-in this week. Even a quick note keeps your trajectory
          accurate and your plan on point.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/progress"
           style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Log this week →
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px;">
          You're receiving this because you have a ${APP_NAME} account.
        </p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@yourdomain.com>`,
        to: email,
        subject,
        html,
      });
      sent++;
    } catch {
      // continue on individual failures
    }
  }

  return NextResponse.json({ sent });
}
