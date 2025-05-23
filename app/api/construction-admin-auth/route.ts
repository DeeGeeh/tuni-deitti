import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Use the ADMIN_PASS environment variable from Vercel
    const ADMIN_PASSWORD = process.env.ADMIN_PASS;

    if (!ADMIN_PASSWORD) {
      console.error("ADMIN_PASS environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log(password);
    console.log(ADMIN_PASSWORD);

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
