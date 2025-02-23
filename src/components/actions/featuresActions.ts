'use server'
import { createClientServer } from '@/utils/supabase/server'
import { createClient } from "@supabase/supabase-js"
import Replicate from 'replicate'


  export async function image3D(input: { image: string }): Promise<{ updatedCredits?: number; modelUrl?: string; error?: string }> {
    try {

        const supabase = createClientServer()

        const { data, error: authError } = await supabase.auth.getUser();
        //checks if user is authenticated
        if (authError || !data?.user) {
            return {
                error: 'User not authenticated'
            }
        }

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
            return {
                error: userError.message
            }
        }
        //checks if user has enough credits
        if (userData?.credits < 35) {
            return {
                error: 'Not enough credits'
            }
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

        // Here we pass the base64 image into the images array
        const output = await replicate.run(
            "alwynhd/trellis_alwyn:b7e6861629c6a42f3a3f25319c02060ee14e4a310efa07b73f2ae66f1ed851af",
            {
                input: {
                    images: [input.image],
                    seed: 0,
                    texture_size: 1024,
                    mesh_simplify: 0.95,
                    generate_color: true,
                    generate_model: true,
                    randomize_seed: true,
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

        
        console.log('heres output', output)
        // Return the new credits and model URL
        const result = {
            updatedCredits: /* Assuming userData.credits is defined */ userData.credits - 35,
            modelUrl: output.model_file
          };
      
          // Convert to a plain JSON-serializable object
          return JSON.parse(JSON.stringify(result));
    } catch (err) {
        return { error: 'Something went wrong' }
    }
}
