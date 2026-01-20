import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/scheduler';

export async function GET(request: NextRequest) {
  try {
    console.log('Manual trigger: Processing scheduled posts...');
    await processScheduledPosts();
    return NextResponse.json({ success: true, message: 'Scheduled posts processed' });
  } catch (error: any) {
    console.error('Error processing scheduled posts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Same as GET - process scheduled posts
  return GET(request);
}