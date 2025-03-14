"use client"

import { useState, useEffect } from "react"
import PricingOverlay from "@/components/pricingOverlay/pricingOverlay"

export default function FreePlanOverlayWrapper({ isFreePlan }: { isFreePlan: boolean }) {
    const [showPricingOverlay, setShowPricingOverlay] = useState(isFreePlan)
    
    // Update overlay visibility if free plan status changes
    useEffect(() => {
        setShowPricingOverlay(isFreePlan)
    }, [isFreePlan])
    
    return (
        <PricingOverlay 
            isOpen={showPricingOverlay} 
            onClose={() => setShowPricingOverlay(false)}
        />
    )
}