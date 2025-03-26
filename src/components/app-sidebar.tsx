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
// import { isUserOnFreePlan } from "./actions/billingActions"
import { useEffect, useState } from "react"
import Link from "next/link"
// This is sample data.
import { Lock, Plus } from "lucide-react"
import PricingOverlay from '@/components/pricingOverlay/pricingOverlay' // Add this import

import { getUserBilling } from "@/components/actions/billingActions"

const data = {

  guide: [

    {
      title: "Guide",
      url: "/dashboard/guide",
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
      title: "Free Tools",
      url: "#",
      icon: Quote,
      isActive: true,
      items: [
        {
          title: "Format Converter",
          url: "/dashboard/tools-free/format-convert",
        },

      ],
    },


  ],

}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [showPricingOverlay, setShowPricingOverlay] = useState(false)
  const [credits, setCredits] = useState(0);
  const [isFreePlan, setIsFreePlan] = useState(true);

  useEffect(() => {
    async function fetchUserBilling() {
      try {
        const billingData = await getUserBilling();
        setCredits(billingData.credits || 0);
        setIsFreePlan(billingData.credits === 0);
      } catch (error) {
        console.error("Failed to fetch user billing:", error);
        setCredits(0);
        setIsFreePlan(true);
      }
    }

    fetchUserBilling();
  }, []);


    const handlePurchase = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault()
        
            const form = document.createElement('form')
            form.method = 'GET'
            form.action = '/api/stripe_once'

            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'priceID'
            input.value = 'price_1R49jsCcCkxwgwE85NFlzqZJ'

            form.appendChild(input)
            document.body.appendChild(form)
            form.submit()
        
    }


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard">
          <LogoTitle logoPath="/favicon/Logo-Fox-Light.svg" title="Simple Mesh" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {state === 'expanded' && (
        <>
          <div
            onClick={() => handlePurchase()}
            className="mx-4 my-4 block hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Purchase more credits"
          >
            <div className="p-4 rounded-md bg-primary/10 text-center text-primary shadow-sm border border-primary/20 hover:bg-primary/20 cursor-pointer">
              {/* Coin/Credit Icon */}
              <div className="flex justify-center mb-3">
                <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>

              {/* New Heading */}
              <h2 className="text-base font-semibold text-primary">Need More Credits?</h2>

              {/* Updated Subtext */}
              <p className="mt-2 text-xs text-muted-foreground">
                Your free credits are running low. Recharge to continue using all features.
              </p>

              {/* Updated Button */}
              <div className="inline-flex items-center justify-center mt-2 px-3 py-1.5 bg-primary text-white rounded-md transition-colors text-sm hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Get More Credits
              </div>
            </div>
          </div>

          {/* Add the PricingOverlay component */}
          <PricingOverlay
            isOpen={showPricingOverlay}
            onClose={() => setShowPricingOverlay(false)}
          />
        </>
      )}

      <NavMain items={data.guide} />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
