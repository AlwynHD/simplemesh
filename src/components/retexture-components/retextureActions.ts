"use server"
import { createClientServer } from '@/utils/supabase/server'
import { convertImageToPng } from '@/components/actions/featuresActions';
import Replicate from 'replicate'


export async function imageUpscaler(input: { 
    image: string, 
    seed?: number,
    resemblance?: number,
    prompt?: string,
    negative_prompt?: string,
    sharpen?: number,
    creativity?: number,
    num_inference_steps?: number,
    mask?: string
  }): Promise<{ image?: string; error?: string }> {
    try {
      const supabase = createClientServer();
      
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data?.user) {
        return { error: 'User not authenticated' };
      }
      
      let pngBuffer: Buffer;
      let pngImage: string;
      try {
        pngBuffer = await convertImageToPng(input.image);
        pngImage = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      } catch (conversionError) {
        console.error('Error converting image to PNG:', conversionError);
        return { error: 'Failed to process image' };
      }
  
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN!,
        useFileOutput: false,
      });
  
      const seed = input.seed !== undefined ? input.seed : 1337;
      const resemblance = input.resemblance !== undefined ? input.resemblance : 0.6;
      const prompt = input.prompt || "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>";
      const negative_prompt = input.negative_prompt || "(worst quality, low quality, normal quality:2) JuggernautNegative-neg";
      const sharpen = input.sharpen !== undefined ? input.sharpen : 0;
      const creativity = input.creativity !== undefined ? input.creativity : 0.35;
      const num_inference_steps = input.num_inference_steps !== undefined ? input.num_inference_steps : 18;
      
      const upscalerInput: any = {
        seed: seed,
        image: pngImage,
        prompt: prompt,
        dynamic: 6,
        handfix: "disabled",
        pattern: false,
        sharpen: sharpen,
        sd_model: "juggernaut_reborn.safetensors [338b85bc4f]",
        scheduler: "DPM++ 3M SDE Karras",
        creativity: creativity,
        lora_links: "",
        downscaling: true,
        resemblance: resemblance,
        scale_factor: 2,
        tiling_width: 112,
        output_format: "png",
        tiling_height: 144,
        custom_sd_model: "",
        negative_prompt: negative_prompt,
        num_inference_steps: num_inference_steps,
        downscaling_resolution: 768
      };
      
      if (input.mask) {
        upscalerInput.mask = input.mask;
      }
  
      const output = await replicate.run(
        "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
        { input: upscalerInput }
      );
      
      let imageUrl: string;
      
      if (Array.isArray(output) && output.length > 0) {
        const firstItem = output[0];
        
        if (typeof firstItem === 'string') {
          imageUrl = firstItem;
        }
        else if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
          if (typeof firstItem.url === 'string') {
            imageUrl = firstItem.url;
          } 
          else if (typeof firstItem.url === 'function') {
            imageUrl = firstItem.url();
          }
          else {
            throw new Error('Unexpected url property type in output');
          }
        }
        else {
          console.log("Unexpected output format:", JSON.stringify(output));
          throw new Error('Unexpected output format from Replicate');
        }
      } else {
        console.log("Empty or non-array output:", JSON.stringify(output));
        throw new Error('No output received from Replicate');
      }
      
      return { image: imageUrl };
      
    } catch (err) {
      console.error('Error in imageUpscaler:', err);
      return { error: String(err) };
    }
  }