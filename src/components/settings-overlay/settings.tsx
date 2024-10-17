'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const settingsOptions = [
  { id: 'general', label: 'General' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC" />
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="********" />
            </div>
          </div>
        );
      // Add cases for 'notifications' and 'privacy' as needed
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <Card className="w-[1200px]">
      <CardHeader>
        <CardTitle className="text-2xl">Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex">
        <div className="w-1/4 border-r pr-4">
          {settingsOptions.map((option) => (
            <Button
              key={option.id}
              variant={activeTab === option.id ? "default" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setActiveTab(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="w-3/4 pl-6">
          <h2 className="text-xl font-semibold mb-4">{settingsOptions.find(o => o.id === activeTab)?.label}</h2>
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}