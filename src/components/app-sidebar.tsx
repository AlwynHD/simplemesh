"use client"
import { useSidebar } from "@/components/ui/sidebar"

import * as React from "react"
import {

  Image,
  Quote,
  Grid,
  BookText,
  Sparkles,
  LayoutDashboard
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { LogoTitle } from "@/components/LogoTitle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { isUserOnFreePlan } from "./actions/billingActions"
import { useEffect, useState } from "react"
import Link from "next/link"
// This is sample data.
import { Lock } from "lucide-react"
const data = {
  teams: [
    {
      name: "Simple Mesh",
      logoPath: "/favicon/Logo-Fox-Light.svg",
      plan: "Free",
    },
  ],
  guide: [

    {
      title: "Guide",
      url: "#",
      icon: BookText,
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Image To 3D",
      url: "/dashboard/image-3d",
      icon: Image,
    },
    {
      title: "Text To 3D",
      url: "/dashboard/text-3d",
      icon: Quote,
    },
    {
      title: "Texture Generation",
      url: "/dashboard/texture-generation",
      icon: Grid,
    }

  ],

}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isFreePlan, setIsFreePlan] = useState(false)
  const { state } = useSidebar();


  useEffect(() => {
    async function checkPlan() {
      const free = await isUserOnFreePlan()
      setIsFreePlan(free)
    }
    checkPlan()
  }, [])

  console.log(state);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <LogoTitle logoPath="/favicon/Logo-Fox-Light.svg" title="Simple Mesh" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {isFreePlan && state === 'expanded' && (
        <Link
          href="/pricing"
          className="mx-4 my-4 block hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Upgrade to full plan for full feature access"
        >
          <div className="p-4 rounded-md bg-primary/10 text-center text-primary shadow-sm border border-primary/20 hover:bg-primary/20 cursor-pointer">
            {/* Sparkles Icon */}
            <div className="flex justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>

            {/* Friendly Heading */}
            <h2 className="text-base font-semibold text-primary">Free Plan Access</h2>

            {/* Updated Subtext */}
            <p className="mt-2 text-xs text-muted-foreground">
              Upgrade to access our full set of features.
            </p>

            {/* Upgrade Now Button */}
            <div className="inline-flex items-center justify-center mt-2 px-3 py-1.5 bg-primary text-white rounded-md transition-colors text-sm hover:bg-primary/90">
              <Lock className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Upgrade Now
            </div>
          </div>
        </Link>
      )}

      <NavMain items={data.guide} />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
