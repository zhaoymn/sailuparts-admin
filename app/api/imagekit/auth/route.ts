import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import crypto from 'crypto';

// Add route segment config to disable caching
export const dynamic = 'force-dynamic';

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export async function GET() {
  try {
    // Generate a unique token using timestamp and random string
    // const token = crypto.randomUUID();
    // const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const result = imagekit.getAuthenticationParameters();
    // Add cache control headers
    // return NextResponse.json(result, {
    //   headers: {
    //     'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    //     'Pragma': 'no-cache',
    //     'Expires': '0',
    //   },
    // });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}