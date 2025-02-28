"use client"

import React, { useState, useEffect } from 'react'
import { text3D } from '@/components/actions/featuresActions'
import { useCreditStore } from '@/stores/creditStore'
import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator'
import ModelViewer from '@/components/ModelViewer'

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
import { Textarea } from "@/components/ui/textarea"

// Icons
import { Hash, Loader, RefreshCw, Wand2 } from 'lucide-react'

export default function Text3D() {
  // State
  const [prompt, setPrompt] = useState<string>('')
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [containerStatus, setContainerStatus] = useState<'unknown' | 'cold' | 'warm'>('unknown')
  const [elapsedTime, setElapsedTime] = useState<string>('')
  const [modelUrl, setModelUrl] = useState<string>()
  
  const setCredits = useCreditStore(state => state.setCredits)

  // Track elapsed time during generation
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isLoading && startTime) {
      intervalId = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(`${seconds}s`)
      }, 1000)
    } else {
      setElapsedTime('')
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isLoading, startTime])

  const handleGenerate = async () => {
    try {
      if (!prompt.trim()) {
        setError('Please enter a prompt')
        return
      }

      setIsLoading(true)
      setStartTime(Date.now())
      setContainerStatus('unknown')
      setError(null)

      const loadingRef = { current: true }

      // Check container status after 20 seconds
      const statusTimer = setTimeout(() => {
        if (loadingRef.current) {
          setContainerStatus('cold')
        }
      }, 20000)

      // If response comes back within 5 seconds, mark container as warm
      const warmTimer = setTimeout(() => {
        if (loadingRef.current) {
          setContainerStatus('warm')
        }
      }, 5000)

      try {
        const result = await text3D({
          prompt: prompt,
          seed: seed,
          credits: 0 // This will be checked server-side
        })

        clearTimeout(statusTimer)
        clearTimeout(warmTimer)

        if (result?.error) {
          setError(result.error)
          setIsLoading(false)
          loadingRef.current = false
          return
        }

        if (result?.updatedCredits) {
          setCredits(result.updatedCredits)
        }

        if (result.modelUrl && result.modelId) {
          const urlString = result.modelUrl.toString()
          setModelUrl(urlString)

          generateAndUploadThumbnail(urlString, result.modelId)
            .catch(error => {
              console.error("Error in thumbnail workflow:", error)
            })
        } else {
          setError("No model URL returned")
        }

        setIsLoading(false)
        loadingRef.current = false
      } catch (err) {
        clearTimeout(statusTimer)
        clearTimeout(warmTimer)
        console.error(err)
        setError('Failed to generate model')
        setIsLoading(false)
        loadingRef.current = false
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
        width: 512,
        height: 512,
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
              Text To 3D
            </SidebarGroupLabel>
            <hr className="border-border" />

            <SidebarGroupContent className="p-4 space-y-6">
              {/* Prompt Section */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter text prompt..."
                  className="mt-1.5 min-h-[100px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Describe the 3D model you want to generate
                </p>
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

              {/* Generate Button */}
              <Button
                className="w-full h-10 mt-4"
                size="lg"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
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
              
              {containerStatus === 'cold' && (
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