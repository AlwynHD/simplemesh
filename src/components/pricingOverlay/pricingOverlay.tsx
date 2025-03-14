"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, X } from "lucide-react"
import { checkUserAuth } from "@/app/pricing/components/isUser"
import Modal from '@/components/modal'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'

interface Plan {
    name: string
    monthlyPrice: number
    monthlyCreditsPrice: number
    features: string[]
    priceID: string
    popular?: boolean
}

interface PricingOverlayProps {
    isOpen: boolean
    onClose: () => void
    defaultOpen?: boolean
}

const plans: Plan[] = [
    {
        name: "Personal",
        monthlyPrice: 9,
        monthlyCreditsPrice: 0.9,
        features: ["1000 Credits Monthly", "Image to 3D", "Text to 3D"],
        priceID: "price_1R1UlDCcCkxwgwE8lQhnxKdP",
    },
    {
        name: "Pro",
        monthlyPrice: 19,
        monthlyCreditsPrice: 0.76,
        features: ["2500 Credits Monthly", "Image to 3D", "Text to 3D"],
        priceID: "price_1R1UlHCcCkxwgwE8i0BdR3su",
        popular: true,
    },
    {
        name: "Enterprise",
        monthlyPrice: 99,
        monthlyCreditsPrice: 0.65,
        features: ["10000 Credits Monthly", "Image to 3D", "Text to 3D"],
        priceID: "price_1R1dFzCcCkxwgwE88AGetiKp",
    },
]

export default function PricingOverlay({ isOpen: externalIsOpen, onClose, defaultOpen = false }: PricingOverlayProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
    const closeModal = () => setIsModalOpen(false)
    
    const handleClose = () => {
        if (onClose) {
            onClose()
        } else {
            setInternalIsOpen(false)
        }
    }

    const handleChoosePlan = async (priceID: string, e?: React.MouseEvent) => {
        if (e) e.preventDefault()
        
        setSelectedPlan(priceID)
        const isAuthenticated = await checkUserAuth()

        if (!isAuthenticated) {
            setIsModalOpen(true)
        } else {
            const form = document.createElement('form')
            form.method = 'GET'
            form.action = '/stripe'

            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'priceID'
            input.value = priceID

            form.appendChild(input)
            document.body.appendChild(form)
            form.submit()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-background border border-border rounded-xl shadow-lg max-w-6xl w-full relative my-8"
                >
                    {/* Close button */}
                    <button 
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close pricing overlay"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="container mx-auto px-2 sm:px-4 py-8 md:py-16 flex flex-col items-center">
                        <div className="text-center mb-6 md:mb-10 max-w-2xl">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-3 tracking-tight">Upgrade Your Plan</h2>
                            <p className="text-sm md:text-base text-muted-foreground">Choose the perfect plan to unlock all features and credits</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 justify-center w-full max-w-6xl">
                            {plans.map((plan) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * plans.indexOf(plan) }}
                                    className={`h-full ${selectedPlan === plan.priceID ? "ring-2 ring-primary" : ""}`}
                                >
                                    <Card className={`flex flex-col h-full border-2 ${
                                        plan.popular 
                                            ? "border-primary shadow-lg md:scale-105" 
                                            : "border-border"} 
                                        rounded-xl overflow-hidden`}
                                    >
                                        {plan.popular && (
                                            <div className="bg-primary py-1.5 px-3 text-primary-foreground text-sm font-medium text-center flex items-center justify-center gap-1">
                                                <Sparkles className="h-4 w-4" />
                                                Most Popular
                                            </div>
                                        )}
                                        <CardHeader className={`pb-1 ${plan.popular ? "bg-primary/5" : ""}`}>
                                            <CardTitle className={`text-xl md:text-2xl font-bold ${plan.popular ? "text-primary" : "text-foreground"}`}>
                                                {plan.name}
                                            </CardTitle>
                                        </CardHeader>
                                        
                                        <CardContent className="flex-grow pt-4 md:pt-6">
                                            <div className="flex items-baseline mb-4 md:mb-6">
                                                <span className="text-3xl md:text-4xl font-extrabold text-foreground">${plan.monthlyPrice}</span>
                                                <span className="text-xs md:text-sm font-medium text-muted-foreground ml-2">/month</span>
                                            </div>
                                            
                                            <div className="inline-block text-xs md:text-sm bg-muted rounded-full px-3 py-1 mb-4 md:mb-6 text-muted-foreground">
                                                ${plan.monthlyCreditsPrice} per 100 Credits
                                            </div>
                                            
                                            <div className="border-t border-border pt-4 md:pt-5 mb-2">
                                                <h4 className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-2 md:mb-3 font-medium">What's included</h4>
                                                <ul className="space-y-2 md:space-y-3">
                                                    {plan.features.map((feature, index) => (
                                                        <li key={index} className="flex items-start text-sm md:text-base text-foreground">
                                                            <Check className={`h-4 w-4 md:h-5 md:w-5 ${plan.popular ? "text-primary" : "text-foreground"} mr-2 shrink-0 mt-0.5`} />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </CardContent>
                                        
                                        <CardFooter className="pt-3 md:pt-4 pb-4 md:pb-6">
                                            <Button
                                                className={`w-full py-4 md:py-6 text-sm md:text-base font-medium ${plan.popular 
                                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                                                    : "bg-muted hover:bg-muted/90 text-foreground"}`}
                                                onClick={(e) => handleChoosePlan(plan.priceID, e)}
                                            >
                                                {plan.popular ? "Start with Pro" : `Get ${plan.name}`}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-muted-foreground px-2">
                            All plans include access to our 3D creation tools. <br/>
                            Need help choosing? <a href="mailto:support@simplemesh.com" className="text-primary underline underline-offset-2">Contact our team</a>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </AnimatePresence>
    )
}