import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = "f94b94b90dc243f2832bfd76962a215d";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://salutebutton.com";

// POST /api/indexnow
// Body: { urls: string[] } or { url: string }
// Header: x-api-secret must match INDEXNOW_SECRET env var
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-api-secret");
  if (!secret || secret !== process.env.INDEXNOW_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const urls: string[] = body.urls ?? (body.url ? [body.url] : []);

  if (urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  // Ensure URLs are absolute
  const absoluteUrls = urls.map((u: string) =>
    u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`
  );

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    urlList: absoluteUrls,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      status: res.status,
      submitted: absoluteUrls,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to ping IndexNow", details: String(error) },
      { status: 500 }
    );
  }
}
