import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user'; // TODO: Implement proper auth
    
    const socialAccounts = await prisma.socialAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Remove sensitive tokens from response
    const sanitized = socialAccounts.map((account: any) => ({
      ...account,
      accessToken: account.accessToken ? '***' : null,
      refreshToken: account.refreshToken ? '***' : null,
    }));
    
    return NextResponse.json({ success: true, accounts: sanitized });
  } catch (error: any) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default-user'; // TODO: Implement proper auth
    const body = await request.json();
    
    const { platform, platformId, accountName, avatarUrl, accessToken, refreshToken, tokenExpiry, metadata } = body;
    
    // Upsert social account
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform,
          platformId: platformId || '',
        },
      },
      update: {
        accountName,
        avatarUrl,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
        metadata,
        isActive: true,
      },
      create: {
        userId,
        platform,
        platformId: platformId || '',
        accountName,
        avatarUrl,
        accessToken,
        refreshToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
        metadata,
        isActive: true,
      },
    });
    
    return NextResponse.json({ success: true, account: socialAccount });
  } catch (error: any) {
    console.error('Error saving social account:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
