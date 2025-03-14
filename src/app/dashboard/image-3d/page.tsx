"use client"

import { useState, useEffect, useRef } from 'react'
import { useCreditStore } from '@/stores/creditStore'
import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator'

// UI Components
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
import ModelViewer from "@/components/ModelViewer"

// Icons
import { Image, X, RefreshCw, Wand2, Loader, UploadCloud, Hash, Coins } from 'lucide-react'

// Actions
import { image3D, checkReplicateStatus } from "@/components/actions/featuresActions"

export default function Image3D() {
  // State
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string>()
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const dropzoneRef = useRef<HTMLDivElement>(null)
  const setCredits = useCreditStore(state => state.setCredits)

  // Example price - this would typically come from your API or config
  const featureCreditCost = 35

  const [predictionId, setPredictionId] = useState<string | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isLoading && startTime) {
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const seconds = Math.floor((elapsed / 1000) % 60);
        const minutes = Math.floor((elapsed / 1000 / 60) % 60);

        setElapsedTime(`${minutes}m ${seconds}s`);
      }, 1000); // Update every second
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, startTime]);

  // Add this polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (predictionId && isLoading) {
      intervalId = setInterval(async () => {
        try {
          const result = await checkReplicateStatus(predictionId);

          if (result.status === 'failed' || result.status === 'canceled') {
            clearInterval(intervalId!);
            setError('Model generation failed');
            setIsLoading(false);
          }

          if (result.status === 'succeeded') {
            clearInterval(intervalId!);

            // Use the URL directly from Replicate!
            if (result.output?.model_file) {
              setModelUrl(result.output.model_file);

              // Still generate a thumbnail
              if (modelId) {
                generateAndUploadThumbnail(result.output.model_file, modelId);
              }
            } else {
              setError("No model URL returned");
            }

            setIsLoading(false);
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [predictionId, isLoading, modelId]);

  // Set up drag and drop event listeners
  useEffect(() => {
    const dropzone = dropzoneRef.current
    if (!dropzone) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0])
      }
    }

    dropzone.addEventListener('dragover', handleDragOver)
    dropzone.addEventListener('dragleave', handleDragLeave)
    dropzone.addEventListener('drop', handleDrop)

    return () => {
      dropzone.removeEventListener('dragover', handleDragOver)
      dropzone.removeEventListener('dragleave', handleDragLeave)
      dropzone.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleFileUpload = (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please select a JPEG or PNG image only')
      return
    }

    setError(null)
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
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


      setPredictionId(null)
      setModelId(null)
      setModelUrl(undefined)
      
      setIsLoading(true)
      setStartTime(Date.now())
      setError(null)

      const loadingRef = { current: true }



      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedImage)

      reader.onload = async () => {
        const base64Image = reader.result as string



        try {
          const result = await image3D({
            image: base64Image,
            seed: seed,
          })

        

          if (result?.error) {
            setError(result.error)
            setIsLoading(false)
            loadingRef.current = false
            return
          }

          if (result?.updatedCredits) {
            setCredits(result.updatedCredits)
          }

          // Store the prediction ID and model ID for polling
          if (result.predictionId) {
            setPredictionId(result.predictionId)
          }

          if (result.modelId) {
            setModelId(result.modelId)
          }



        } catch (err) {

          console.error(err)
          setError('Failed to generate model')
          setIsLoading(false)
          loadingRef.current = false
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
      const thumbnailGenerator = createThumbnailGenerator({
        width: 1024,
        height: 1024,
      })

      const thumbnailDataUrl = await thumbnailGenerator.generateThumbnail(modelUrl)
      await thumbnailGenerator.uploadThumbnail(thumbnailDataUrl, modelId)
    } catch (error) {
      console.error("Error generating or uploading thumbnail:", error)
    }
  }

  return (
    <div className="flex h-full relative">
      <Sidebar className="border-r border-border w-80" variant="inset" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-semibold text-primary px-4 py-3">
              Image To 3D
            </SidebarGroupLabel>
            <hr className="border-border" />

            <SidebarGroupContent className="p-4 space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium flex items-center gap-1.5">
                  <Image className="h-4 w-4" />
                  Upload Image
                </Label>

                {!imagePreview ? (
                  <div
                    ref={dropzoneRef}
                    className={`mt-1 flex justify-center rounded-lg border ${isDragging ? 'border-primary bg-primary/5' : 'border-dashed border-border'} p-6 cursor-pointer hover:bg-muted/50 transition-colors`}
                    onClick={() => document.getElementById('image')?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div className="mt-2 text-sm text-muted-foreground flex justify-center items-center">
                        <Label htmlFor="image" className="relative cursor-pointer font-medium text-primary hover:underline">
                          Upload a file
                          <Input
                            id="image"
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">PNG or JPG up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2 rounded-md overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-80 shadow-md"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Seed Section */}
              <div className="space-y-2">
                <Label htmlFor="seed" className="text-sm font-medium flex items-center gap-1.5">
                  <Hash className="h-4 w-4" />
                  Seed (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="seed"
                    type="number"
                    placeholder="Random seed"
                    value={seed === undefined ? '' : seed}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value)
                      setSeed(val)
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                    className="shrink-0"
                    title="Generate random seed"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Leave empty for random results</p>
              </div>

              {/* Credit Pricing Section */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Credit Cost</span>
                  </div>
                  <span className="font-semibold text-amber-500">{featureCreditCost} credits</span>
                </div>
                {/* <p className="text-xs text-muted-foreground mt-1">
                  This amount will be deducted from your account when you generate a model
                </p> */}
              </div>

              {/* Generate Button */}
              <Button
                className="w-full h-10 mt-4"
                size="lg"
                onClick={handleGenerate}
                disabled={!selectedImage || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating Model...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate 3D Model
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="text-destructive bg-destructive/10 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 bg-muted/30 overflow-hidden relative">
        <ModelViewer modelUrl={modelUrl} />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card/40 p-8 rounded-xl shadow-lg text-center max-w-sm mx-auto border border-border">
              <div className="relative">
                <div className="size-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <Loader className="h-8 w-8 absolute inset-0 m-auto text-primary" />
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-2">Generating 3D Model</h3>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span className="inline-block px-2 py-1 bg-muted rounded text-sm font-mono">
                  {elapsedTime || "0s"}
                </span>
                <span className="text-sm">elapsed</span>
              </div>

              {startTime && (Date.now() - startTime) / 1000 > 20 && (
                <p className="text-muted-foreground mt-4 text-sm">
                  Your model is in queue. This may take up to 5 minutes.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}