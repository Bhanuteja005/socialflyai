import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || process.env.LINKEDIN_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const { imageUrl, visibility = 'PUBLIC', organizationId } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const author = organizationId
      ? `urn:li:organization:${organizationId}`
      : `urn:li:person:${profileResponse.data.sub}`;

    // First, register the image upload
    const registerResponse = await axios.post(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: author,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.data.value.asset;

    // Download the image from the provided URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Upload the image to LinkedIn
    await axios.put(uploadUrl, imageBuffer, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': imageResponse.headers['content-type'] || 'image/jpeg',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Image uploaded to LinkedIn successfully',
      asset: asset,
    });
  } catch (error: any) {
    console.error('Image upload error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to upload image to LinkedIn',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}