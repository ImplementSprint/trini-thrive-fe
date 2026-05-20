import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile } = await supabaseAdmin
      .from("beneficiary_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: account } = await supabaseAdmin
      .from("beneficiary_bank_accounts")
      .select("id, bank_name, account_number")
      .eq("id", id)
      .eq("beneficiary_profile_id", profile.id)
      .single();

    if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await supabaseAdmin
      .from("beneficiary_bank_accounts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    await supabaseAdmin.from("beneficiary_banking_activity").insert({
      beneficiary_profile_id: profile.id,
      bank_account_id: id,
      event_type: "account_deactivated",
      status: "completed",
      details: `${account.bank_name} account ending in ${String(account.account_number).slice(-4)} removed.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
