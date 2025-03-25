"use server"


import { AppSidebar } from "@/components/app-sidebar"

import {
    SidebarInset,
    SidebarProvider,
   
} from "@/components/ui/sidebar"
import { createClientServer } from "@/utils/supabase/server"
import { redirect } from "next/navigation"


import { getUserBilling } from "@/components/actions/billingActions"
import { TopBar } from "@/components/TopBar"
import { MobileAccessRestriction } from "@/components/mobile-access-restriction"
// import { isUserOnFreePlan } from "@/components/actions/billingActions"
import  FreePlanOverlayWrapper  from "@/components/pricingOverlay/freePlanOverlayWrapper"
import { LoginWithLogo } from "@/components/login-components/login-with-logo"
import Modal from "@/components/modal"
export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClientServer()
    
    const { data, error } = await supabase.auth.getUser()
    const isAuthenticated = !error && data?.user

    // if (error || !data?.user) {
    //     redirect('/login')
    // }
    
    const [billingData ] = await Promise.all([
        getUserBilling(),
    ])

    
    let isFreePlan = true
    // console.log(isFreePlan)
    if (billingData.credits > 0) {
        isFreePlan = false
    }
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar initialCredits={billingData.credits} />
                    <div className="relative flex flex-col h-full w-full">
                        <div className="absolute inset-0 flex overflow-hidden">
                            <div className="w-full h-full rounded-xl bg-muted/50 overflow-auto">
                                {children}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
                <MobileAccessRestriction />
                {/* <FreePlanOverlayWrapper isFreePlan={isFreePlan} /> */}
            </SidebarProvider>
            
            {!isAuthenticated && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="w-full max-w-[350px] sm:max-w-md">
                        <LoginWithLogo />
                    </div>
                </div>
            )}
        </>
    )
}