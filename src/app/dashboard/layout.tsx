"use server"


import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClientServer } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NavUser } from "@/components/nav-user"

import { getUserBilling, getUserPlan } from "@/components/actions/billingActions"
export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClientServer()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        console.log(error)
        console.log(data)
        redirect('/login')
    }

    const [billingData, planData] = await Promise.all([
        getUserBilling(),
        getUserPlan()
    ])
    console.log("billingData", billingData)
    console.log("plandata", planData)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex w-full items-center justify-between px-4">
                        {/* Left section */}
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-2 mr-2" />
                            <Separator orientation="vertical" className="h-5" />
                            {/* You can add breadcrumbs or page title here */}
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-4">
                            {/* Credits display */}
                            <div className="flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full border border-border/50">
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Credits:</span>
                                    <span className="text-sm font-semibold text-foreground">{billingData.credits}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4 mx-2" />
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {planData.plan}
                                </Badge>
                            </div>

                            {/* User menu */}
                            <NavUser variant="small" />
                        </div>
                    </div>
                </header>
                <div className="relative flex flex-col h-full w-full">
                    <div className="absolute inset-0 flex overflow-hidden">
                        <div className="w-full h-full rounded-xl bg-muted/50 overflow-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}