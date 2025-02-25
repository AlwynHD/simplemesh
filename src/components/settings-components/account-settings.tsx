"use client"

// app/settings/components/AccountSettings.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Trash2, Mail, MessageSquare, Shield, FileText, Settings, User } from "lucide-react"
import useUserData from "@/hooks/use-userData"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

const AccountSettings = () => {
  const { user, error, isLoading } = useUserData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) return <div className="flex items-center justify-center h-full p-8"><div className="animate-pulse text-muted-foreground">Loading account information...</div></div>;
  if (error) return <div className="p-8 text-destructive flex items-center justify-center">Unable to load account information. Please try again.</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Section with Enhanced Banner */}
      <Card className="border shadow-md bg-card overflow-hidden">
        <div className="relative">
          {/* Enhanced gradient banner with pattern overlay */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')"
            }}></div>

          </div>
        </div>

        <CardContent className="pt-0 relative pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md -mt-12 relative z-10">
                <AvatarImage src={user?.avatar} alt={user?.name || "Profile"} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                  {user?.name?.[0] || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Avatar edit overlay */}
              <div className="absolute inset-0 -mt-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">

              </div>
            </div>
            <div className="space-y-1.5 flex-grow">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{user?.name}</h2>

              </div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                {user?.email}
              </p>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-primary" />
              Account
            </CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                Deleting your account will permanently remove all your data and cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal and Support Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Help & Resources
            </CardTitle>
            <CardDescription>Support and legal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <a href="mailto:support@simplemesh.com" className="block">
                <div className="flex items-center rounded-md p-2.5 bg-accent/40 hover:bg-accent/60 transition-colors">
                  <Mail className="mr-2 h-4 w-4 text-primary/80" />
                  <p className="text-sm text-primary/90 font-medium">support@simplemesh.com</p>
                </div>
              </a>
              <a href="https://discord.gg/example" target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center rounded-md p-2.5 bg-accent/40 hover:bg-accent/60 transition-colors">
                  <MessageSquare className="mr-2 h-4 w-4 text-primary/80" />
                  <p className="text-sm text-primary/90 font-medium inline-flex items-center">
                    Discord Community
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Documents */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Legal Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/terms" className="block">
              <div className="flex items-center rounded-md p-2.5 bg-accent/40 hover:bg-accent/60 transition-colors">
                <FileText className="mr-2 h-4 w-4 text-primary/80" />
                <p className="text-sm font-medium">Terms & Conditions</p>
              </div>
            </Link>
            <Link href="/privacy" className="block">
              <div className="flex items-center rounded-md p-2.5 bg-accent/40 hover:bg-accent/60 transition-colors">
                <Shield className="mr-2 h-4 w-4 text-primary/80" />
                <p className="text-sm font-medium">Privacy Policy</p>
              </div>
            </Link>
          </div>

          <Separator className="my-2" />

          <p className="text-xs text-center text-muted-foreground pt-2">
            © {new Date().getFullYear()} simplemesh. All rights reserved.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action permanently removes all your data and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Please type <strong className="font-semibold">delete</strong> below to confirm:
            </p>
            <input
              type="text"
              className="mt-2 w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Type 'delete' to confirm"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="sm:flex-1">
              Cancel
            </Button>
            <Button variant="destructive" className="sm:flex-1">
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountSettings