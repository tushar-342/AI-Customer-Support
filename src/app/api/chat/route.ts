import { NextResponse } from "next/server";
import { z } from "zod";
import { handleChat } from "@/server/agent";

const bodySchema = z.object({ customerId: z.string(), message: z.string() });
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request. Choose a customer and enter a message." }, { status: 400 });
    return NextResponse.json(await handleChat(parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The support agent is temporarily unavailable.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
