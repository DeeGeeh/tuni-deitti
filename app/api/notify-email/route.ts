import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // TODO
    // 1. Save to database
    // 2. Add to email list
    // 3. Send confirmation email

    console.log(`New email signup: ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
