"use client"

import { motion } from "framer-motion"

interface SmoothToggleProps {
  isYearly: boolean
  onToggle: (value: boolean) => void
}

export function SmoothToggle({ isYearly, onToggle }: SmoothToggleProps) {
  return (
    <div className="relative w-64 h-12 bg-secondary rounded-full cursor-pointer" onClick={() => onToggle(!isYearly)}>
      <motion.div
        className="absolute top-1 left-1 w-[calc(50%-2px)] h-10 bg-primary rounded-full"
        animate={{ x: isYearly ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <div className="absolute inset-0 flex items-center justify-around text-sm font-medium">
        <span className={isYearly ? "text-secondary-foreground" : "text-primary-foreground z-10"}>Monthly</span>
        <span className={isYearly ? "text-primary-foreground z-10" : "text-secondary-foreground"}>Yearly</span>
      </div>
    </div>
  )
}

