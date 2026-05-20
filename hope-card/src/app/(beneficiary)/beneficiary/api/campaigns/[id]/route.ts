// app/api/campaigns/[id]/route.ts
import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    console.error("[campaigns/id] profile fetch error:", profileError.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: enrollment, error: enrollmentError } = await admin
    .from("campaign_beneficiaries")
    .select("campaign_id")
    .eq("campaign_id", id)
    .eq("beneficiary_profile_id", profile.id)
    .single();
  if (enrollmentError && enrollmentError.code !== "PGRST116") {
    console.error("[campaigns/id] enrollment check error:", enrollmentError.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!enrollment) return NextResponse.json({ error: "Not enrolled in this campaign" }, { status: 403 });

  const [
    { data: campaign, error: campError },
    { data: disbursements, error: disbError },
  ] = await Promise.all([
    admin
      .from("hc_campaigns")
      .select("id, title, description, category, status, target_amount, collected_amount, start_date, end_date, created_by")
      .eq("id", id)
      .single(),
    admin
      .from("beneficiary_disbursements")
      .select("id, reference_id, amount, status, disbursed_at, created_at")
      .eq("campaign_id", id)
      .eq("beneficiary_profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  if (campError) {
    console.error("[campaigns/id] hc_campaigns fetch error:", campError.message);
    return NextResponse.json({ error: "Failed to load campaign details" }, { status: 500 });
  }
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (disbError) {
    console.error("[campaigns/id] disbursements fetch error:", disbError.message);
    return NextResponse.json({ error: "Failed to load campaign details" }, { status: 500 });
  }

  const { data: manager } = await admin
    .from("campaign_manager_profiles")
    .select("first_name, last_name, organization_name, email, phone")
    .eq("auth_user_id", campaign.created_by)
    .single();

  return NextResponse.json({
    campaign: {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      status: campaign.status,
      target_amount: Number(campaign.target_amount),
      collected_amount: Number(campaign.collected_amount),
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    },
    manager: manager
      ? {
          full_name: `${manager.first_name} ${manager.last_name}`.trim(),
          organization_name: manager.organization_name,
          email: manager.email,
          phone: manager.phone,
        }
      : null,
    disbursements: (disbursements ?? []).map((d: {
      id: string; reference_id: string; amount: number;
      status: string; disbursed_at: string | null; created_at: string;
    }) => ({
      id: d.id,
      reference_id: d.reference_id,
      amount: Number(d.amount),
      status: d.status,
      disbursed_at: d.disbursed_at,
      created_at: d.created_at,
    })),
    total_received: Number(campaign.collected_amount),
  });
}
