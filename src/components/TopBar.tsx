"use client"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NavUser } from "@/components/nav-user"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useCreditStore } from "@/stores/creditStore"
import { useEffect } from "react"

interface TopBarProps {
  initialCredits: number;
  planType: string;
}

export function TopBar({ initialCredits, planType }: TopBarProps) {
    const credits = useCreditStore((state) => state.credits)
    
    useEffect(() => {
        useCreditStore.setState({ credits: initialCredits })
    }, [initialCredits])

    return (
        <header className="flex h-16 shrink-0 items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full items-center justify-between px-4">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="-ml-2 mr-2" />
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full border border-border/50">
                        <div className="flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Credits:</span>
                            <span className="text-sm font-semibold text-foreground">{credits}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4 mx-2" />
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {planType}
                        </Badge>
                    </div>
                    <NavUser variant="small" />
                </div>
            </div>
        </header>
    )
}