"use server"


import { AppSidebar } from "@/components/app-sidebar"

import {
    SidebarInset,
    SidebarProvider,
   
} from "@/components/ui/sidebar"
import { createClientServer } from "@/utils/supabase/server"
import { redirect } from "next/navigation"


import { getUserBilling, getUserPlan } from "@/components/actions/billingActions"
import { TopBar } from "@/components/TopBar"
import { MobileAccessRestriction } from "@/components/mobile-access-restriction"
export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClientServer()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }
    
    const [billingData, planData] = await Promise.all([
        getUserBilling(),
        getUserPlan()
    ])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar initialCredits={billingData.credits} planType={planData.plan} />
                <div className="relative flex flex-col h-full w-full">
                    <div className="absolute inset-0 flex overflow-hidden">
                        <div className="w-full h-full rounded-xl bg-muted/50 overflow-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
            <MobileAccessRestriction />
        </SidebarProvider>
    )
}