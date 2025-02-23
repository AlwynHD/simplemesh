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

export default async function Text3D() {
  const [error, setError] = useState<string | null>(null)

  const setCredits = useCreditStore(state => state.setCredits)
    
  const handleGenerate = async () => {
    try {
      const result = await image3D()
      
      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.updatedCredits) {
        setCredits(result.updatedCredits)
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
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter text prompt..."
                  className="mt-1.5 min-h-[100px] resize-none"
                  required
                />
              </div>

              <div>
                <Label htmlFor="seed">Seed </Label>
                <Input
                  id="seed"
                  type="number"
                  placeholder="Enter number..."
                  className="mt-1.5"
                  min={1}
                  required
                />
              </div>

              <Button className="w-full" onClick={() => handleGenerate()}>
                Generate Model
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </Sidebar>
      <main className="flex-1 bg-muted/50  overflow-hidden">
        <ModelViewer/>

      </main>
      {/* <div className="fixed bottom-4 right-4 p-4 bg-background/80 backdrop-blur rounded-lg border border-border shadow-lg">
        <p className="text-sm text-muted-foreground">
          Generate 3D models from text descriptions using AI. Enter a prompt and seed value, then click Generate.
        </p>
      </div> */}
    </div>

  )
}
