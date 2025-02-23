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
import { useState } from 'react'

export default function Text3D() {
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string>()

  const setCredits = useCreditStore(state => state.setCredits)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleGenerate = async () => {
    try {
      if (!selectedImage) {
        setError('Please select an image')
        return
      }

      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedImage)

      reader.onload = async () => {
        const base64Image = reader.result as string

        const result = await image3D({
          image: base64Image
        })

        if (result?.error) {
          setError(result.error)
          return
        }
        console.log(result)
        if (result?.updatedCredits) {
          setCredits(result.updatedCredits)
          console.log("Updated credits:", result.updatedCredits)
        }
        if (result.modelUrl) {
          const urlString = result.modelUrl.toString();
          setModelUrl(urlString);          
          console.log("Model URL:", result.modelUrl)
        } else {
          console.log("No model URL returned", result)
        }
      }
    } catch (err) {
      setError('Failed to generate model')
    }
  }

  return (
    <div className="flex h-full">
      <Sidebar className="border-t border-r border-b border-border" variant="inset" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-semibold text-primary">Image To 3D</SidebarGroupLabel>
            <hr className="my-2 border-border" />

            <SidebarGroupContent className="p-2 space-y-4">
              <div>
                <Label htmlFor="image">Upload Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1.5"
                  required
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 max-w-full h-auto rounded"
                  />
                )}
              </div>

              <Button className="w-full" onClick={handleGenerate}>
                Generate Model
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 bg-muted/50  overflow-hidden">
        <ModelViewer modelUrl={modelUrl} />
      </main>
    </div>
  )
}
