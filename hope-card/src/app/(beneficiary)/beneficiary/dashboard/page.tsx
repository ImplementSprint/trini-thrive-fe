import { redirect } from "next/navigation";
import { createClient } from "@/beneficiary-utils/supabase/server";
import { DashboardClient } from "./dashboard-client";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/beneficiary/login");

  const displayName =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email ??
    "Beneficiary";

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id, total_amount_received, verification_status, created_at")
    .eq("auth_user_id", user.id)
    .single();

  const verificationStatus = beneficiary?.verification_status ?? "pending";
  const totalAmountReceived = Number(beneficiary?.total_amount_received ?? 0);

  type TxRow = {
    id: string;
    reference_number: string;
    amount: number | string;
    status: string;
    created_at: string;
    approved_at: string | null;
  };

  let recentTransactions: { ref_no: string; date: string; amount: string; status: "Approved" | "Pending" | "Rejected" }[] = [];
  let lastPaymentDate = "—";
  let lastPaymentAmount = "—";
  let totalTransfers = 0;

  // Determine whether the user has any bank account on file
  const { data: profile } = await supabase
    .from("beneficiary_profiles")
    .select("id, account_number, created_at")
    .eq("auth_user_id", user.id)
    .single();

  let hasBankDetails = !!profile?.account_number;
  if (!hasBankDetails && profile?.id) {
    const { count } = await supabase
      .from("beneficiary_bank_accounts")
      .select("id", { count: "exact", head: true })
      .eq("beneficiary_profile_id", profile.id)
      .eq("is_active", true);
    hasBankDetails = (count ?? 0) > 0;
  }

  if (beneficiary?.id) {
    const { data: txRows } = await supabase
      .from("beneficiary_transactions")
      .select("id, reference_number, amount, status, created_at, approved_at")
      .eq("beneficiary_id", beneficiary.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const rows = (txRows ?? []) as TxRow[];
    const approvedRows = rows.filter((t) => t.status === "approved");
    totalTransfers = approvedRows.length;

    if (approvedRows.length > 0) {
      const last = approvedRows[0];
      lastPaymentDate = formatDate(last.approved_at ?? last.created_at);
      lastPaymentAmount = formatCurrency(Number(last.amount));
    }

    recentTransactions = rows.map((t) => ({
      ref_no: t.reference_number,
      date: formatDate(t.created_at),
      amount: formatCurrency(Number(t.amount)),
      status: (t.status.charAt(0).toUpperCase() + t.status.slice(1)) as "Approved" | "Pending" | "Rejected",
    }));
  }

  async function logout() {
    "use server";
    const { cookies } = await import("next/headers");
    const supabase = await createClient();
    await supabase.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.set('persona', '', { path: '/', sameSite: 'strict', maxAge: 0 });
    redirect("/beneficiary/login");
  }

  const activeSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;

  return (
    <DashboardClient
      displayName={displayName}
      totalAmount={formatCurrency(totalAmountReceived)}
      verificationStatus={verificationStatus}
      logoutAction={logout}
      lastPaymentDate={lastPaymentDate}
      lastPaymentAmount={lastPaymentAmount}
      totalTransfers={totalTransfers}
      recentTransactions={recentTransactions}
      activeSince={activeSince}
      hasBankDetails={hasBankDetails}
    />
  );
}
