import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { downloadFile } from '@/components/actions/featuresActions';

export async function POST(request: NextRequest) {
  try {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
      })
    const body = await request.json();
    const { userId, modelId } = Object.fromEntries(request.nextUrl.searchParams);
    console.log('Webhook body:', body);
    if (!userId || !modelId || body.status !== 'succeeded') {
      return NextResponse.json({ success: false });
    }
    
    if (body.output?.model_file) {
      const fileBuffer = await downloadFile(body.output.model_file);
      
      const fileKey = `users/${userId}/models/${modelId}.glb`;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: 'model/gltf-binary'
      });
      
      await s3Client.send(command);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}