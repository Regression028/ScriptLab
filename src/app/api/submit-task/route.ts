
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sourceCode, languageId = 63 } = await req.json();

    const apiKey = process.env.ONLINECOMPILER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ONLINECOMPILER_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    if (typeof sourceCode !== "string" || !sourceCode.trim()) {
      return NextResponse.json(
        { error: "Source code is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.onlinecompiler.io/api/judge0/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": apiKey,
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OnlineCompiler API error:", data);

      return NextResponse.json(
        {
          error:
            data.error ||
            data.message ||
            `Code execution API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      stdout: data.stdout?.trim() ?? "",
      stderr: data.stderr?.trim() ?? "",
      compile_output: data.compile_output?.trim() ?? "",
      status: data.status?.description ?? "",
    });
  } catch (error) {
    console.error("Submit task error:", error);

    return NextResponse.json(
      { error: "Failed to run code. Check the server terminal." },
      { status: 500 }
    );
  }
}
