"use client"

// app/settings/components/AccountSettings.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useUserData from "@/hooks/use-userData"
const AccountSettings = () => {
  const { user, error, isLoading } = useUserData();

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar} alt="Profile" />
            <AvatarFallback>{user?.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-2xl font-medium">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">
             {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings