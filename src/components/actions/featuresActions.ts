'use server'
import { createClientServer } from '@/utils/supabase/server'
import { createClient } from "@supabase/supabase-js"
import Replicate from 'replicate'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Helper function to download file from URL
async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function image3D(input: { image: string, seed?: number }): Promise<{ updatedCredits?: number; modelUrl?: string; modelId?: string; error?: string }> {
  try {
    const supabase = createClientServer()

    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user) {
      return { error: 'User not authenticated' }
    }
    const userId = data.user.id;

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { data: userData, error: userError } = await supabaseService
      .from('user_billing')
      .select('credits')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      return { error: userError.message }
    }

    if (userData?.credits < 35) {
      return { error: 'Not enough credits' }
    }
    const updatedCredits = userData.credits - 35

    const { error: updateError } = await supabaseService
      .from('user_billing')
      .update({ credits: updatedCredits })
      .eq('id', data.user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    interface PredictOutput {
      color_video: string;
      combined_video: string;
      gaussian_ply: string;
      model_file: string;
      no_background_images: string[];
      normal_video: string;
    }
    
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
      useFileOutput: false,
    })

    const output = await replicate.run(
      "alwynhd/trellis_alwyn:b7e6861629c6a42f3a3f25319c02060ee14e4a310efa07b73f2ae66f1ed851af",
      {
        input: {
          images: [input.image],
          seed: input.seed !== undefined ? input.seed : 0,
          texture_size: 1024,
          mesh_simplify: 0.95,
          generate_color: false,
          generate_model: true,
          randomize_seed: input.seed === undefined,
          generate_normal: false,
          save_gaussian_ply: false,
          ss_sampling_steps: 12,
          slat_sampling_steps: 12,
          return_no_background: false,
          ss_guidance_strength: 7.5,
          slat_guidance_strength: 3
        }
      }
    ) as PredictOutput;
    const fileId = uuidv4();
    // Upload to S3 if model was generated
    if (output.model_file) {
      try {
        // Download file from Replicate
        const fileBuffer = await downloadFile(output.model_file);
        
        // Generate UUID and path
        
        const fileKey = `users/${userId}/models/${fileId}.glb`;
        
        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: fileKey,
          Body: fileBuffer,
          ContentType: 'model/gltf-binary'
        });
        
        await s3Client.send(command);
        
        // Important: Keep returning the original Replicate URL instead of the S3 URL
        // Don't modify output.model_file to prevent the S3 URL from being used
      } catch (uploadError) {
        console.error('Error uploading to S3:', uploadError);
      }
    }
    
    // Return the original Replicate URL
    return {
      updatedCredits,
      modelUrl: output.model_file,
      modelId: fileId
    };
  } catch (err) {
    console.error('Error in image3D:', err);
    return { error: 'Something went wrong' }
  }
}


import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function listUserModels(): Promise<{ models: Array<{id: string, name: string, url: string, createdAt: string, favorite: boolean}> | null; error?: string }> {
  try {
    const supabase = createClientServer()
    
    // Get authenticated user
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user) {
      return { models: null, error: 'User not authenticated' }
    }
    const userId = data.user.id;
    
    // List objects in the user's folder
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
      Prefix: `users/${userId}/models/`,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      return { models: [] }
    }
    
    // Transform S3 objects to model data
    const models = response.Contents.map(item => {
      const filename = item.Key!.split('/').pop()!;
      const id = filename.replace('.glb', '');
      const name = `Model ${id.substring(0, 8)}`;
      
      return {
        id,
        name,
        // Use CloudFront URL instead of direct S3 URL
        url: `https://${process.env.CLOUDFRONT_DOMAIN}/${item.Key}`,
        createdAt: item.LastModified?.toISOString() || new Date().toISOString(),
        favorite: false,
      }
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { models };
  } catch (err) {
    console.error('Error listing user models:', err);
    return { models: null, error: 'Something went wrong' }
  }
}



import { HeadObjectCommand } from "@aws-sdk/client-s3";

export async function getModelById(modelId: string): Promise<{ model: {id: string, name: string, url: string, createdAt: string, favorite: boolean} | null; error?: string }> {
  try {
    const supabase = createClientServer()
    
    // Get authenticated user
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user) {
      return { model: null, error: 'Access Denied' }
    }
    const userId = data.user.id;
    
    // Get specific object from the user's folder
    const objectKey = `users/${userId}/models/${modelId}.glb`;
    
    // Check if the object exists
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: objectKey,
    });
    
    try {
      const objectData = await s3Client.send(headCommand);
      
      // Object exists, return model data
      return {
        model: {
          id: modelId,
          name: `Model ${modelId.substring(0, 8)}`,
          // Use CloudFront URL instead of direct S3 URL
          url: `https://${process.env.CLOUDFRONT_DOMAIN}/${objectKey}`,
          createdAt: objectData.LastModified?.toISOString() || new Date().toISOString(),
          favorite: false, // You'd need to fetch this from user preferences/local storage
        }
      };
    } catch (error) {
      // Object doesn't exist or user doesn't have access
      return { model: null, error: 'Access denied' };
    }
  } catch (err) {
    console.error('Error getting model:', err);
    return { model: null, error: 'Something went wrong' }
  }
}



// Add this to your existing featuresActions.ts file

export async function uploadThumbnail(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientServer();
    
    // Get authenticated user
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user) {
      return { success: false, error: 'User not authenticated' };
    }
    const userId = data.user.id;
    
    // Get the thumbnail file and model ID from the FormData
    const thumbnailFile = formData.get('thumbnail') as File;
    const modelId = formData.get('modelId') as string;
    
    if (!thumbnailFile || !modelId) {
      return { success: false, error: 'Missing thumbnail or model ID' };
    }
    
    // Convert File to Buffer for S3 upload
    const arrayBuffer = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set the S3 path
    const fileKey = `users/${userId}/thumbnails/${modelId}.jpg`;
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileKey,
      Body: buffer,
      ContentType: 'image/jpeg'
    });
    
    await s3Client.send(command);
    
    return { success: true};
  } catch (err) {
    console.error('Error uploading thumbnail:', err);
    return { success: false, error: 'Failed to upload thumbnail' };
  }
}