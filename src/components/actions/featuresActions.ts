'use server'
import { createClientServer } from '@/utils/supabase/server'
import { createClient } from "@supabase/supabase-js"
import Replicate from 'replicate'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Helper function to download file from URL
export async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function image3D(input: { image: string, seed?: number }): Promise<{ updatedCredits?: number; modelUrl?: string; modelId?: string; predictionId?: string; error?: string }> {
  try {
    const supabase = createClientServer()
    const cost = 35
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

    if (userData?.credits < cost) {
      return { error: 'Not enough credits' }
    }
    const updatedCredits = userData.credits - cost

    const { error: updateError } = await supabaseService
      .from('user_billing')
      .update({ credits: updatedCredits })
      .eq('id', data.user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    // interface PredictOutput {
    //   color_video: string;
    //   combined_video: string;
    //   gaussian_ply: string;
    //   model_file: string;
    //   no_background_images: string[];
    //   normal_video: string;
    // }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
      useFileOutput: false,
    })
    const fileId = uuidv4();

    await storeModelMetadata(userId, fileId, input.image) //do this before as it doesnt matter if before or not


    const webhookUrl = `https://www.simplemesh.ai/api/replicate-webhook?userId=${userId}&modelId=${fileId}`;
    
    const prediction = await replicate.predictions.create({
      version: "b7e6861629c6a42f3a3f25319c02060ee14e4a310efa07b73f2ae66f1ed851af",
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
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed"]
    });


    return {
      updatedCredits,
      predictionId: prediction.id,
      modelId: fileId
    };
  } catch (err) {
    console.error('Error in image3D:', err);
    return { error: 'Something went wrong' }
  }
}


export async function text3D(input: { prompt: string, seed?: number, credits: number }): Promise<{ updatedCredits?: number; modelUrl?: string; modelId?: string; error?: string }> {
  try {
    const supabase = createClientServer()
    const cost = 40
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

    if (userData?.credits < cost) {
      return { error: 'Not enough credits' }
    }
    const updatedCredits = userData.credits - cost

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
    type PredictImageOutput = string[];

    const outputImage = await replicate.run(
      "black-forest-labs/flux-dev",
      {
        input: {
          prompt: input.prompt,
          go_fast: true,
          guidance: 3.5,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "jpg",
          output_quality: 80,
          prompt_strength: 0.8,
          num_inference_steps: 28,
        }
      }
    ) as PredictImageOutput;
    console.log(outputImage)
    const output = await replicate.run(
      "alwynhd/trellis_alwyn:b7e6861629c6a42f3a3f25319c02060ee14e4a310efa07b73f2ae66f1ed851af",
      {
        input: {
          images: [outputImage[0]],
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
        await storeModelMetadata(
          userId,
          fileId,
          outputImage[0]
        );
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
    console.error('Error in Text3D:', err);
    return { error: 'Something went wrong' }
  }


}

import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function listUserModels(): Promise<{ models: Array<{ id: string, name: string, url: string, createdAt: string, favorite: boolean }> | null; error?: string }> {
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

    // Fetch metadata file to get descriptions
    let metadata: Record<string, { id: string, description: string }> = {};
    try {
      const metadataCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `users/${userId}/metadata.json`,
      });

      const metadataResponse = await s3Client.send(metadataCommand);
      const metadataString = await metadataResponse.Body?.transformToString();
      if (metadataString) {
        metadata = JSON.parse(metadataString);
      }
    } catch (error) {
      // If metadata file doesn't exist or can't be parsed, continue with empty metadata
      console.error("Error fetching metadata:", error);
    }

    // Transform S3 objects to model data
    const models = response.Contents.map(item => {
      const filename = item.Key!.split('/').pop()!;
      const id = filename.replace('.glb', '');

      // Get description from metadata if available
      const modelMetadata = metadata[id];
      const name = modelMetadata?.description || `Model description unavailable`;

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




export async function getModelById(modelId: string): Promise<{ model: { id: string, name: string, url: string, createdAt: string, favorite: boolean } | null; error?: string }> {
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
      return { model: null, error: 'Access denied' + error };
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

    return { success: true };
  } catch (err) {
    console.error('Error uploading thumbnail:', err);
    return { success: false, error: 'Failed to upload thumbnail' };
  }
}


import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function deleteModel(modelId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientServer();

    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user) {
      return { success: false, error: 'User not authenticated' };
    }
    const userId = data.user.id;

    // 1. Delete the model file
    const modelKey = `users/${userId}/models/${modelId}.glb`;
    const deleteModelCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: modelKey
    });
    await s3Client.send(deleteModelCommand);

    // 2. Delete the thumbnail file if it exists
    try {
      const thumbnailKey = `users/${userId}/thumbnails/${modelId}.jpg`;
      const deleteThumbnailCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: thumbnailKey
      });
      await s3Client.send(deleteThumbnailCommand);
    } catch (thumbnailError) {
      // Thumbnail might not exist, continue with deletion
      console.log('Thumbnail may not exist or other error:', thumbnailError);
    }

    // 3. Update metadata.json to remove the model
    const metadataKey = `users/${userId}/metadata.json`;

    try {
      // Fetch current metadata
      const getCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: metadataKey
      });

      const response = await s3Client.send(getCommand);
      const bodyContents = await response.Body?.transformToString();

      if (bodyContents) {
        const metadata = JSON.parse(bodyContents);

        // Delete the entry for this model
        if (metadata[modelId]) {
          delete metadata[modelId];
        }

        // Upload updated metadata
        const updateMetadataCommand = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: metadataKey,
          Body: JSON.stringify(metadata, null, 2),
          ContentType: 'application/json'
        });

        await s3Client.send(updateMetadataCommand);
      }
    } catch (metadataError) {
      console.error('Error updating metadata:', metadataError);
      // Continue with deletion even if metadata update fails
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting model:', err);
    return { success: false, error: 'Failed to delete model' };
  }
}

export async function storeModelMetadata(
  userId: string,
  modelId: string,
  image: string
): Promise<void> {

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
    useFileOutput: false,
  })

  interface PredictOutput {
    // The output is an array of strings
    items: string[];
  }

  const output = await replicate.run(
    "orickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb",
    {
      input: {
        image: image,
        prompt: "Describe the image's main object in 5 words or less using general language.",
        // You can also add these optional parameters if needed
        // top_p: 1,
        // temperature: 0.2,
        // max_tokens: 1024
      }
    }
  ) as PredictOutput;
  console.log(output.items);
  // To access the response content
  let description = '';
  if (output) {
    if (Array.isArray(output)) {
      description = output.join('');
    } else if (typeof output === 'string') {
      description = output;
    } else if (output.items && Array.isArray(output.items)) {
      description = output.items.join('');
    } else {
      console.log('Unexpected output format:', output);
      description = 'Image description unavailable';
    }
  }

  // Set up the path for the metadata JSON file
  const metadataKey = `users/${userId}/metadata.json`;

  // First try to get existing metadata if it exists
  let existingMetadata: Record<string, { id: string, description: string }> = {};
  try {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: metadataKey
    });

    const response = await s3Client.send(getCommand);
    const bodyContents = await response.Body?.transformToString();
    if (bodyContents) {
      existingMetadata = JSON.parse(bodyContents);
    }
  } catch (error) {
    // File doesn't exist yet, we'll create it
    console.log('Creating new metadata file' + error);
  }

  // Add the new model to metadata
  existingMetadata[modelId] = {
    id: modelId,
    description: description,
  };

  // Upload updated metadata
  const metadataCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: metadataKey,
    Body: JSON.stringify(existingMetadata, null, 2),
    ContentType: 'application/json'
  });

  await s3Client.send(metadataCommand);
}

//Check the status of the prediction
export async function checkReplicateStatus(predictionId: string): Promise<{ 
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: {
    model_file?: string;
    color_video?: string;
    combined_video?: string;
    gaussian_ply?: string;
    normal_video?: string;
    no_background_images?: string[];
  };
  error?: string;
}> {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
      useFileOutput: false,
    });
    
    const prediction = await replicate.predictions.get(predictionId);
    
    return {
      status: prediction.status,
      output: prediction.output
    };
  } catch (err) {
    console.error('Error checking Replicate status:', err);
    return { 
      status: 'failed',
      error: 'Failed to check model status' 
    };
  }
}

