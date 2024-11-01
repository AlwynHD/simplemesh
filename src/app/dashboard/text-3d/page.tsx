"use server"

import { createClient } from "@/utils/supabase/server"
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
export default async function Text3D() {

  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    console.log(data)
    redirect('/login')
  }

  return (
    <div className="flex h-full">
      <Sidebar className="border-t border-r border-b border-border" variant="inset" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-semibold text-primary">Text To 3D</SidebarGroupLabel>
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

              <Button className="w-full">
                Generate Model
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </Sidebar>
      <main className="flex-1 bg-muted/50 p-4">
        <ModelViewer />

      </main>
    </div>
  )
}
