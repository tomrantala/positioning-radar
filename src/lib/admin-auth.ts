import { NextRequest, NextResponse } from "next/server";

export function validateAdminRequest(request: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
