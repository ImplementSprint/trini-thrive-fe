import { createClient as createServerClient } from "@/beneficiary-utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);
const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData = await request.formData() as any;
    const file = formData.get("file") as File | null;
    const label = formData.get("label") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File must be under 5 MB." }, { status: 400 });
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json({ error: "File must be a JPG, PNG, or PDF." }, { status: 400 });
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

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const storageKey = `identity-docs/${user.id}/${Date.now()}.${rawExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("beneficiary-ids")
      .upload(storageKey, fileBuffer, {
        contentType: MIME_MAP[rawExt]!,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: doc, error: insertError } = await supabaseAdmin
      .from("beneficiary_identity_documents")
      .insert({
        beneficiary_profile_id: profile.id,
        document_key: storageKey,
        document_label: label || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from("beneficiary-ids").remove([storageKey]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
