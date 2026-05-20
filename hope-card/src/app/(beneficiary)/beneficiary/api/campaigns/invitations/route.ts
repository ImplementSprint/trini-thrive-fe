// app/api/campaigns/invitations/route.ts
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
    console.error("[invitations] profile fetch error:", profileError.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: invitations, error } = await admin
    .from("campaign_invitations")
    .select("id, campaign_id, invited_at")
    .eq("beneficiary_profile_id", profile.id)
    .eq("status", "pending")
    .order("invited_at", { ascending: false });

  if (error) {
    console.error("[invitations] fetch error:", error.message);
    return NextResponse.json({ error: "Failed to load invitations" }, { status: 500 });
  }

  if (!invitations || invitations.length === 0) {
    return NextResponse.json({ invitations: [] });
  }

  const campaignIds = invitations.map((i: { campaign_id: string }) => i.campaign_id);

  const { data: campaigns, error: campaignsError } = await admin
    .from("hc_campaigns")
    .select("id, title, category, description, target_amount, created_by")
    .in("id", campaignIds);

  if (campaignsError) {
    console.error("[invitations] campaigns fetch error:", campaignsError.message);
    return NextResponse.json({ error: "Failed to load invitations" }, { status: 500 });
  }

  const createdBys = [...new Set((campaigns ?? []).map((c: { created_by: string }) => c.created_by))];

  let managers: { auth_user_id: string; organization_name: string | null }[] = [];
  if (createdBys.length > 0) {
    const { data: managersData, error: managersError } = await admin
      .from("campaign_manager_profiles")
      .select("auth_user_id, organization_name")
      .in("auth_user_id", createdBys);
    if (managersError) {
      console.error("[invitations] managers fetch error:", managersError.message);
      return NextResponse.json({ error: "Failed to load invitations" }, { status: 500 });
    }
    managers = managersData ?? [];
  }

  const campaignMap = new Map((campaigns ?? []).map((c: { id: string; title: string; category: string | null; description: string | null; target_amount: number; created_by: string }) => [c.id, c]));
  const managerMap = new Map(managers.map((m: { auth_user_id: string; organization_name: string | null }) => [m.auth_user_id, m]));

  return NextResponse.json({
    invitations: invitations.map((inv: { id: string; campaign_id: string; invited_at: string }) => {
      const campaign = campaignMap.get(inv.campaign_id);
      const manager = campaign ? managerMap.get(campaign.created_by) : null;
      return {
        id: inv.id,
        campaign_id: inv.campaign_id,
        title: campaign?.title ?? "Unknown Campaign",
        category: campaign?.category ?? null,
        description: campaign?.description ?? null,
        organization_name: manager?.organization_name ?? null,
        target_amount: campaign ? Number(campaign.target_amount) : 0,
        invited_at: inv.invited_at,
      };
    }),
  });
}
