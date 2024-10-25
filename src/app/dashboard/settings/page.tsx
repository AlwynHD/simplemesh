// app/settings/page.tsx
'use client'
import { useState } from 'react'
import AccountSettings from '@/components/settings-components/account-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from '@radix-ui/react-scroll-area'
// import BillingSettings from './components/BillingSettings'
// import SupportSettings from './components/SupportSettings'
// import ResourceSettings from './components/ResourceSettings'

const SettingsPage = () => {

    return (
        // <ScrollArea className=''>
        <div className="h-full w-full">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="border-b w-full rounded-none justify-start h-auto bg-transparent">
                        <TabsTrigger
                            value="account"
                            className="data-[state=active]:border-primary data-[state=active]:bg-muted/60 border-b-2 border-transparent rounded-none px-4"
                        >
                            Account
                        </TabsTrigger>
                        <TabsTrigger
                            value="billing"
                            className="data-[state=active]:border-primary data-[state=active]:bg-muted/60 border-b-2 border-transparent rounded-none px-4"
                        >
                            Billing
                        </TabsTrigger>
                        <TabsTrigger
                            value="support"
                            className="data-[state=active]:border-primary data-[state=active]:bg-muted/60 border-b-2 border-transparent rounded-none px-4"
                        >
                            Support
                        </TabsTrigger>
                        <TabsTrigger
                            value="resources"
                            className="data-[state=active]:border-primary data-[state=active]:bg-muted/60 border-b-2 border-transparent rounded-none px-4"
                        >
                            Resources
                        </TabsTrigger>
                    </TabsList>
                    <div className="bg-muted/30">
                        <TabsContent value="account" className="p-8">
                            <AccountSettings />
                        </TabsContent>
                        <TabsContent value="billing" className="p-8">
                            {/* <BillingSettings /> */}
                        </TabsContent>
                        <TabsContent value="support" className="p-8">
                            {/* <SupportSettings /> */}
                        </TabsContent>
                        <TabsContent value="resources" className="p-8">
                            {/* <ResourceSettings /> */}
                        </TabsContent>
                    </div>
                </Tabs>
        </div>
        // </ScrollArea>
    )
}

export default SettingsPage