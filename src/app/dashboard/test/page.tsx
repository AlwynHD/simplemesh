"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ModelViewer from "@/components/ModelViewer"
import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator'
import Image from "next/image"

export default function ModelThumbnailTest() {
  const [modelUrl, setModelUrl] = useState<string>("/output.glb")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const sampleModels = [
    { name: "Sample Model 1", url: "/output.glb" },
    { name: "Sample Model 2", url: "/output2.glb" },
    { name: "Sample Model 3", url: "/output3.glb" }
  ]

  const handleSelectModel = (value: string) => {
    setModelUrl(value)
    setThumbnailUrl(null) // Reset thumbnail when model changes
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelUrl(e.target.value)
    setThumbnailUrl(null)
  }

  const generateThumbnail = async () => {
    if (!modelUrl) {
      setError("Please provide a model URL")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const thumbnailGenerator = createThumbnailGenerator({
        width: 1024,
        height: 1024,
        
      })
      
      const dataUrl = await thumbnailGenerator.generateThumbnail(modelUrl)
      setThumbnailUrl(dataUrl)
    } catch (err) {
      console.error("Error generating thumbnail:", err)
      setError(`Failed to generate thumbnail: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">3D Model Thumbnail Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Input Section */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Input Model</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-select">Choose a sample model</Label>
                <Select onValueChange={handleSelectModel} defaultValue={modelUrl}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sample model" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleModels.map((model) => (
                      <SelectItem key={model.url} value={model.url}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-url">Or enter a custom model URL</Label>
                <Input 
                  id="custom-url" 
                  placeholder="https://example.com/model.glb" 
                  value={modelUrl}
                  onChange={handleCustomUrlChange}
                />
              </div>

              <Button 
                onClick={generateThumbnail} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Thumbnail"}
              </Button>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Model Viewer */}
        <Card>
          <CardContent className="p-0 aspect-square relative">
            <div className="absolute inset-0">
              <ModelViewer modelUrl={modelUrl} />
            </div>
          </CardContent>
        </Card>
        
        {/* Thumbnail Result */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Thumbnail</h2>
            
            {thumbnailUrl ? (
              <div className="flex flex-col items-center">
                <div className="border rounded-md overflow-hidden max-w-md">
                  <img 
                    src={thumbnailUrl} 
                    alt="Generated thumbnail" 
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = thumbnailUrl
                    link.download = 'model-thumbnail.jpg'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Download Thumbnail
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {isLoading ? "Generating thumbnail..." : "Click 'Generate Thumbnail' to create a snapshot of the model"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}