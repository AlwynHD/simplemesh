"use client"

import { redirect } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ModelViewer from "@/components/ModelViewer"
import { image3D } from "@/components/actions/featuresActions"
import { useCreditStore } from '@/stores/creditStore'
import { useState, useEffect } from 'react'
import { Box, Image, X, RefreshCw, Wand2, Loader } from 'lucide-react'

import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator';


export default function Image3D() {
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string>()
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const setCredits = useCreditStore(state => state.setCredits)
  const [startTime, setStartTime] = useState<number | null>(null);
  const [containerStatus, setContainerStatus] = useState<'unknown' | 'cold' | 'warm'>('unknown');
  const [elapsedTime, setElapsedTime] = useState<string>('');
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isLoading && startTime) {
      // Update the elapsed time every second
      intervalId = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(`(${seconds}s)`);
      }, 1000);
    } else {
      setElapsedTime('');
    }

    // Clean up interval on unmount or when loading stops
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, startTime]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleGenerate = async () => {
    try {
      if (!selectedImage) {
        setError('Please select an image')
        return
      }
  
      setIsLoading(true);
      setStartTime(Date.now());
      setContainerStatus('unknown');
      setError(null);
  
      // Create a ref to track loading state for the timeout callback
      const loadingRef = { current: true };
      
      // Check container status after 10 seconds
      const statusTimer = setTimeout(() => {
        if (loadingRef.current) {
          setContainerStatus('cold');
        }
      }, 20000);
  
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedImage)
  
      reader.onload = async () => {
        const base64Image = reader.result as string
        console.log("seed:", seed)
  
        // If response comes back within 5 seconds, mark container as warm
        const warmTimer = setTimeout(() => {
          if (loadingRef.current) {
            setContainerStatus('warm');
          }
        }, 5000);
  
        try {
          const result = await image3D({
            image: base64Image,
            seed: seed
          })
  
          clearTimeout(statusTimer);
          clearTimeout(warmTimer);
  
          if (result?.error) {
            setError(result.error)
            setIsLoading(false)
            loadingRef.current = false;
            return
          }

        console.log(result)
        if (result?.updatedCredits) {
          setCredits(result.updatedCredits)
          console.log("Updated credits:", result.updatedCredits)
        }

        if (result.modelUrl && result.modelId) {
          const urlString = result.modelUrl.toString();
          setModelUrl(urlString);
          console.log("Model URL:", result.modelUrl);
        
          generateAndUploadThumbnail(urlString, result.modelId)
          .catch(error => {
            console.error("Error in thumbnail workflow:", error);
          });
          console.log("Thumbnail generation started");
        
        } else {
          console.log("No model URL returned", result)
          setError("No model URL returned")
        }

        

        setIsLoading(false)
        loadingRef.current = false;
      } catch (err) {
        clearTimeout(statusTimer);
        clearTimeout(warmTimer);
        console.error(err)
        setError('Failed to generate model')
        setIsLoading(false)
        loadingRef.current = false;
      }
    }
  } catch (err) {
    console.error(err)
    setError('Failed to generate model')
    setIsLoading(false)
  }
}

const generateAndUploadThumbnail = async (modelUrl: string, modelId: string): Promise<void> => {
  try {
    console.log("Generating thumbnail for model:", modelUrl);
    
    // Extract the model ID from the URL
    // Assuming the URL format is something like: https://example.com/path/to/modelId.glb

    
    // Create a thumbnail generator
    const thumbnailGenerator = createThumbnailGenerator({
      width: 512,
      height: 512,
      
    });
    
    // Generate the thumbnail
    const thumbnailDataUrl = await thumbnailGenerator.generateThumbnail(modelUrl);
    console.log("Thumbnail generated successfully");
    
    // Upload the thumbnail to S3
    const uploadSuccess = await thumbnailGenerator.uploadThumbnail(thumbnailDataUrl, modelId);
    
    if (uploadSuccess) {
      console.log("Thumbnail uploaded successfully");
    } else {
      console.error("Failed to upload thumbnail");
    }
  } catch (error) {
    console.error("Error generating or uploading thumbnail:", error);
  }
};
  return (
    <div className="flex h-full relative">
      <Sidebar className="border-t border-r border-b border-border" variant="inset" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-semibold text-primary">Image To 3D</SidebarGroupLabel>
            <hr className="my-2 border-border" />

            <SidebarGroupContent className="p-3 space-y-4">
              <div>
                <Label htmlFor="image" className="flex items-center gap-1.5">
                  <Image className="h-4 w-4" />
                  Upload Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1.5"
                  required
                />
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-auto rounded"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="seed" className="flex items-center gap-1.5">
                  <Box className="h-4 w-4" />
                  Seed (Optional)
                </Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    id="seed"
                    type="number"
                    placeholder="Enter number..."
                    value={seed === undefined ? '' : seed}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                      setSeed(val);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for random results</p>
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={!selectedImage || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Model
                  </>
                )}
              </Button>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 bg-muted/50 overflow-hidden relative">
        <ModelViewer modelUrl={modelUrl} />

        {isLoading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="bg-background p-6 rounded-lg shadow-lg text-center">
              <Loader className="h-10 w-10 animate-spin mx-auto text-primary" />
              <h3 className="text-xl font-semibold mt-4">Generating 3D Model {elapsedTime}</h3>

              {containerStatus === 'unknown' && (
                <p className="text-muted-foreground mt-2">Please wait...</p>
              )}


              {containerStatus === 'cold' && (
                <p className="text-muted-foreground mt-2">Container is cold booting. This may take up to 5 minutes.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}