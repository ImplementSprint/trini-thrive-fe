// app/api/campaigns/route.ts
import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error: profileError } = await admin
    .from("beneficiary_profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (profileError && profileError.code !== "PGRST116") {
    console.error("[campaigns] profile fetch error:", profileError.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: enrollments, error: enrollmentsError } = await admin
    .from("campaign_beneficiaries")
    .select("campaign_id")
    .eq("beneficiary_profile_id", profile.id);
  if (enrollmentsError) {
    console.error("[campaigns] enrollments fetch error:", enrollmentsError.message);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }

  const campaignIds = (enrollments ?? []).map((e: { campaign_id: string }) => e.campaign_id);

  const { count: pendingInvitations } = await admin
    .from("campaign_invitations")
    .select("id", { count: "exact", head: true })
    .eq("beneficiary_profile_id", profile.id)
    .eq("status", "pending");

  if (campaignIds.length === 0) {
    return NextResponse.json({
      campaigns: [],
      summary: { total_support: 0, active_count: 0, pending_invitations: pendingInvitations ?? 0 },
    });
  }

  const { data: campaigns, error: campaignsError } = await admin
    .from("hc_campaigns")
    .select("id, title, description, category, status, target_amount, collected_amount")
    .in("id", campaignIds);

  if (campaignsError) {
    console.error("[campaigns] hc_campaigns fetch error:", campaignsError.message);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }

  const activeCount = (campaigns ?? []).filter((c: { status: string }) => c.status === "active").length;
  const totalSupport = (campaigns ?? []).reduce((sum: number, c: { collected_amount: number }) => sum + Number(c.collected_amount), 0);

  return NextResponse.json({
    campaigns: (campaigns ?? []).map((c: {
      id: string; title: string; description: string | null;
      category: string | null; status: string;
      target_amount: number; collected_amount: number;
    }) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: c.status,
      target_amount: Number(c.target_amount),
      collected_amount: Number(c.collected_amount),
      total_received: Number(c.collected_amount),
    })),
    summary: {
      total_support: totalSupport,
      active_count: activeCount,
      pending_invitations: pendingInvitations ?? 0,
    },
  });
}
