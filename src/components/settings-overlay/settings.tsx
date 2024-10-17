'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const settingsOptions = [
  { id: 'general', label: 'General', icon: '🔧' },
  { id: 'subscription', label: 'Subscription', icon: '💳' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" className="max-w-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC" className="max-w-sm" />
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="user@example.com" className="max-w-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="********" className="max-w-sm" />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotifications" className="rounded" />
              <Label htmlFor="emailNotifications">Receive email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="pushNotifications" className="rounded" />
              <Label htmlFor="pushNotifications">Receive push notifications</Label>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="dataSharing" className="rounded" />
              <Label htmlFor="dataSharing">Allow data sharing</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteAccount">Delete Account</Label>
              <Button variant="destructive">Delete My Account</Button>
            </div>
          </div>
        );
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
          {settingsOptions.map((option) => (
            <Button
              key={option.id}
              variant={activeTab === option.id ? "default" : "ghost"}
              className="w-full justify-start mb-2 text-left"
              onClick={() => setActiveTab(option.id)}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
        <div className="w-full md:w-3/4 md:pl-6 md:border-l">
          <h2 className="text-2xl font-semibold mb-6">{settingsOptions.find(o => o.id === activeTab)?.label}</h2>
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}