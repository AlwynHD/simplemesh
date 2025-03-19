"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { checkUserAuth } from "@/app/pricing/components/isUser"
import Modal from '@/components/modal'
import { LoginWithLogo } from '@/components/login-components/login-with-logo'
import ComparisonTable from "./comparison-table"
export default function PricingComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const closeModal = () => setIsModalOpen(false)

    const handlePurchase = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault()

        // const isAuthenticated = await checkUserAuth()

        // if (!isAuthenticated) {
        //     // setIsModalOpen(true)
        // } else {
        // Handle purchase for authenticated users
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
        // }
    }

    return (
        <div className="container mx-auto px-4 py-10 flex flex-col items-center">
            <div className="text-center mb-8 max-w-xl">
                <h2 className="text-3xl font-bold mb-2">30 Generations for $9</h2>
                <p className="text-muted-foreground">One-time payment. No subscription.</p>
            </div>

            <Card className="w-full max-w-md border shadow-md rounded-lg overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold text-primary">
                        3D Generation Pack
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-4">
                    <div className="flex items-baseline mb-4">
                        <span className="text-4xl font-bold">$9</span>
                        <span className="text-sm text-muted-foreground ml-2">one-time</span>
                    </div>

                    <ul className="space-y-2 mb-4">
                        {[
                            "30 AI-powered 3D generations",
                            "Image to 3D conversion",
                            "Text to 3D generation",
                            "High-quality exports",
                            "Commercial use allowed"
                        ].map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="pt-2 pb-4">
                    <Button
                        className="w-full py-4 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handlePurchase}
                    >
                        Get Started
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-6 text-sm text-muted-foreground">
                Need help? <a href="mailto:support@simplemesh.com" className="text-primary">Contact our team</a>
            </p>
            <ComparisonTable handlePurchase={handlePurchase} />
            {/* <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className='w-full max-w-[350px] sm:max-w-md'>
                    <LoginWithLogo />
                </div>
            </Modal> */}
        </div>
    )
}