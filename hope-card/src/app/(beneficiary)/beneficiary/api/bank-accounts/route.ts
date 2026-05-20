import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { bank_name, account_holder_name, account_number } = body;

    if (!bank_name || !account_holder_name || !account_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile } = await supabaseAdmin
      .from("beneficiary_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Beneficiary profile not found" }, { status: 404 });
    }

    const { count } = await supabaseAdmin
      .from("beneficiary_bank_accounts")
      .select("id", { count: "exact", head: true })
      .eq("beneficiary_profile_id", profile.id)
      .eq("is_active", true);

    const { data: newAccount, error: insertError } = await supabaseAdmin
      .from("beneficiary_bank_accounts")
      .insert({
        beneficiary_profile_id: profile.id,
        bank_name,
        account_holder_name,
        account_number,
        is_primary: (count ?? 0) === 0,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabaseAdmin.from("beneficiary_banking_activity").insert({
      beneficiary_profile_id: profile.id,
      bank_account_id: newAccount.id,
      event_type: "account_added",
      status: "completed",
      details: `${bank_name} account ending in ${String(account_number).slice(-4)} added.`,
    });

    return NextResponse.json({ account: newAccount }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
