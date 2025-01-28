"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { SmoothToggle } from "./components/smooth-toggle"
import { checkUserAuth } from "./components/isUser"
import Modal from '@/components/modal'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import { useRouter } from 'next/navigation'
import  useUserData from '@/hooks/use-userData'

interface Plan {
    name: string
    monthlyPrice: number
    yearlyPrice: number
    monthlyCreditsPrice: number
    yearlyCreditsPrice: number
    features: string[]
    link: string
    priceID: string
}

const plans: Plan[] = [
    {
        name: "Personal",
        monthlyPrice: 9,
        yearlyPrice: 90,
        monthlyCreditsPrice: 0.9,
        yearlyCreditsPrice: 0.75,
        features: ["1000 Credits Monthly", "Image to 3D ", "Text to 3D", "3D Texture Generation"],
        link: "https://buy.stripe.com/test_eVa3dZ6z31mu3pm8wy",
        priceID: "price_1Qlr2FCcCkxwgwE8Q3hZmzZ8",
    },
    {
        name: "Pro",
        monthlyPrice: 19,
        yearlyPrice: 190,
        monthlyCreditsPrice: 0.76,
        yearlyCreditsPrice: 0.64,
        features: ["2500 Credits Monthly", "Image to 3D ", "Text to 3D", "3D Texture Generation"],
        link: "/auth/signup",
        priceID: "price_1J4Z3bLz1Z6Z6Z6Z",
    },
    {
        name: "Enterprise",
        monthlyPrice: 99,
        yearlyPrice: 990,
        monthlyCreditsPrice: 0.99,
        yearlyCreditsPrice: 0.84,
        features: ["1000 Credits Monthly", "Image to 3D ", "Text to 3D", "3D Texture Generation"],
        link: "/auth/signup",
        priceID: "price_1J4Z3bLz1Z6Z6Z6Z",
    },
]

export default function PricingComponent() {
    const router = useRouter()
    const { user } = useUserData();

    const [isYearly, setIsYearly] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const closeModal = () => setIsModalOpen(false)

    const handleChoosePlan = async (planLink: string) => {
        const isAuthenticated = await checkUserAuth()

        if (!isAuthenticated) {
            setIsModalOpen(true)
        } else {
            router.push(planLink + "?prefilled_email=" + user?.email) 

            // Proceed with choosing the plan
            console.log(`Plan chosen: ${planLink}`)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Choose Your Plan</h2>
            <div className="flex items-center justify-center mb-12">
                <SmoothToggle isYearly={isYearly} onToggle={setIsYearly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center w-full max-w-6xl">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="flex flex-col h-full bg-card text-card-foreground">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-primary text-3xl ">{plan.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="text-3xl font-bold mb-2 text-foreground">
                                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                    <span className="text-sm font-normal text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mb-4">
                                    $
                                    {isYearly ? (plan.yearlyCreditsPrice) : (plan.monthlyCreditsPrice)}
                                    /100 Credits
                                </div>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-foreground">
                                            <Check className="h-5 w-5 text-primary mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={() => handleChoosePlan(plan.link)}
                                >Choose Plan</Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal>
        </div>
    )
}

