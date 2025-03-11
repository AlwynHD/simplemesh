"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { checkUserAuth } from "./components/isUser"
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
        priceID: "price_1R1UlJCcCkxwgwE8i9YRf1sa",
    },
]

export default function PricingComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const closeModal = () => setIsModalOpen(false)

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

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center bg-gradient-to-b from-background to-background/80">
            <div className="text-center mb-12 max-w-2xl">
                <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Simple Pricing for Everyone</h2>
                <p className="text-muted-foreground text-lg">Choose the perfect plan for your 3D creation needs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center w-full max-w-6xl">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`h-full ${selectedPlan === plan.priceID ? "ring-2 ring-primary" : ""}`}
                    >
                        <Card className={`flex flex-col h-full border-2 ${plan.popular ? "border-primary shadow-lg scale-105" : "border-border"} rounded-xl overflow-hidden`}>
                            {plan.popular && (
                                <div className="bg-primary py-1.5 px-3 text-primary-foreground text-sm font-medium text-center flex items-center justify-center gap-1">
                                    <Sparkles className="h-4 w-4" />
                                    Most Popular
                                </div>
                            )}
                            <CardHeader className={`pb-1 ${plan.popular ? "bg-primary/5" : ""}`}>
                                <CardTitle className={`text-2xl font-bold ${plan.popular ? "text-primary" : "text-foreground"}`}>
                                    {plan.name}
                                </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="flex-grow pt-6">
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-extrabold text-foreground">${plan.monthlyPrice}</span>
                                    <span className="text-sm font-medium text-muted-foreground ml-2">/month</span>
                                </div>
                                
                                <div className="inline-block text-sm bg-muted rounded-full px-3 py-1 mb-6 text-muted-foreground">
                                    ${plan.monthlyCreditsPrice} per 100 Credits
                                </div>
                                
                                <div className="border-t border-border pt-5 mb-2">
                                    <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 font-medium">What's included</h4>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start text-foreground">
                                                <Check className={`h-5 w-5 ${plan.popular ? "text-primary" : "text-foreground"} mr-2 shrink-0 mt-0.5`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="pt-4 pb-6">
                                <Button
                                    className={`w-full py-6 text-base font-medium ${plan.popular 
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
            
            <div className="mt-12 text-center text-sm text-muted-foreground">
                All plans include access to our 3D creation tools. <br/>
                Need help choosing? <a href="mailto:support@simplemesh.com" className="text-primary underline underline-offset-2">Contact our team</a>            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    )
}