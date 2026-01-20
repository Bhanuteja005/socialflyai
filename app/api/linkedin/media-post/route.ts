import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      imageUrl,
      linkUrl,
      linkTitle,
      linkDescription,
      visibility = 'PUBLIC',
      organizationId
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        },
      }
    );

    const author = organizationId
      ? `urn:li:organization:${organizationId}`
      : `urn:li:person:${profileResponse.data.sub}`;

    // Build the post content based on what's provided
    const postData: any = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility,
      },
    };

    // Determine media category and add media
    if (imageUrl && linkUrl) {
      // Both image and link - use ARTICLE category with image as thumbnail
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: linkUrl,
          thumbnails: [{
            url: imageUrl
          }]
        },
      ];
    } else if (imageUrl) {
      // Image only - Note: LinkedIn requires image upload for proper URN
      // For now, we'll use ARTICLE category with image as the main content
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: imageUrl,
        },
      ];
    } else if (linkUrl) {
      // Link only - use ARTICLE category
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          originalUrl: linkUrl,
        },
      ];
    } else {
      // Text only
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE';
    }

    console.log('Media Post Data:', JSON.stringify(postData, null, 2));

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'LinkedIn media post created successfully',
      data: response.data,
      postType: imageUrl && linkUrl ? 'image+link' : imageUrl ? 'image' : linkUrl ? 'link' : 'text',
    });
  } catch (error: any) {
    console.error('Media post error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to create LinkedIn media post',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}