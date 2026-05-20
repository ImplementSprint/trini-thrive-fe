import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateWdRef } from "@/beneficiary-lib/reference-number";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { amount, bank_account_id, notes } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const [{ data: profile }, { data: beneficiary }] = await Promise.all([
      supabaseAdmin.from("beneficiary_profiles").select("id").eq("auth_user_id", user.id).single(),
      supabaseAdmin.from("beneficiaries").select("id").eq("auth_user_id", user.id).single(),
    ]);

    if (!beneficiary || !profile) {
      return NextResponse.json({ error: "Beneficiary not found" }, { status: 404 });
    }

    const [{ data: txRows }, { data: wdRows }] = await Promise.all([
      supabaseAdmin
        .from("beneficiary_transactions")
        .select("amount")
        .eq("beneficiary_id", beneficiary.id)
        .eq("status", "approved"),
      supabaseAdmin
        .from("beneficiary_withdrawals")
        .select("amount")
        .eq("beneficiary_id", beneficiary.id)
        .eq("status", "approved"),
    ]);

    const totalReceived = (txRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
    const totalWithdrawn = (wdRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
    const available = totalReceived - totalWithdrawn;

    if (amount > available) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₱${available.toLocaleString("en-PH")}` },
        { status: 400 },
      );
    }

    const referenceNumber = generateWdRef();

    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from("beneficiary_withdrawals")
      .insert({
        beneficiary_id: beneficiary.id,
        bank_account_id: bank_account_id ?? null,
        reference_number: referenceNumber,
        amount,
        status: "pending",
        notes: notes ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabaseAdmin.from("beneficiary_banking_activity").insert({
      beneficiary_profile_id: profile.id,
      bank_account_id: bank_account_id ?? null,
      event_type: "withdrawal_requested",
      status: "pending",
      details: `Withdrawal of ₱${amount.toLocaleString("en-PH")} requested. Ref: ${referenceNumber}`,
    });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
