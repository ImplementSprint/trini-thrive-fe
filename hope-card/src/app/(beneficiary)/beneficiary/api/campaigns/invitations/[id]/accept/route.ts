// app/api/campaigns/invitations/[id]/accept/route.ts
import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
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
    console.error("[accept] profile fetch error:", profileError.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: invitation } = await admin
    .from("campaign_invitations")
    .select("id, campaign_id, status")
    .eq("id", id)
    .eq("beneficiary_profile_id", profile.id)
    .single();

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (invitation.status !== "pending") {
    return NextResponse.json({ error: "Invitation already responded to" }, { status: 409 });
  }

  const { error: enrollError } = await admin
    .from("campaign_beneficiaries")
    .insert({ campaign_id: invitation.campaign_id, beneficiary_profile_id: profile.id });

  if (enrollError && enrollError.code !== "23505") {
    console.error("[accept] enroll error:", enrollError.message);
    return NextResponse.json({ error: "Failed to enroll in campaign" }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("campaign_invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("[accept] update error:", updateError.message);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
