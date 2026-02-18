import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, publicUrl } from "@/lib/r2";
import { rateLimit } from "@/lib/rate-limit";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await rateLimit(`upload:${user.id}`, 20, 60);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const contentType = request.headers.get("content-type");
  if (contentType !== "image/webp") {
    return NextResponse.json(
      { error: "Only image/webp accepted" },
      { status: 400 }
    );
  }

  const body = await request.blob();
  if (body.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 }
    );
  }

  const key = `screenshots/${user.id}/${randomUUID()}.webp`;

  try {
    await uploadToR2(key, body, contentType);
    return NextResponse.json({ publicUrl: publicUrl(key) });
  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
