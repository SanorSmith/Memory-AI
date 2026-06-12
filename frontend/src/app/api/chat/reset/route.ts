import { NextResponse } from 'next/server';

export async function DELETE() {
  // In serverless, conversation history is managed client-side
  // This endpoint exists for API compatibility
  return NextResponse.json({ message: 'Conversation reset' });
}
