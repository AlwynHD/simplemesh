"use client"
import { useRouter } from 'next/navigation'

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/components/login-components/login-actions"
import useUserData from "@/hooks/use-userData"
export function NavUser({ variant = "default" }: { variant?: "default" | "small" }) {
  const { isMobile, } = useSidebar()
  const { user,   } = useUserData();
  const router = useRouter()

  const avatarContent = (
    <Avatar className={`h-8 w-8 ${variant === "small" ? "rounded-full" : "rounded-lg"}`}>
      <AvatarImage src={user?.avatar} alt={user?.name} />
      <AvatarFallback className={variant === "small" ? "rounded-full" : "rounded-lg"}>
        {user?.email[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  if (variant === "small") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none group">
          <div className="flex items-center gap-2 rounded-lg border border-transparent p-1 transition-colors hover:bg-accent hover:text-accent-foreground">
            {avatarContent}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg">{user?.email[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action="/stripe" method="GET">
                <button className="flex w-full items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </button>
              </form>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => signOut()}>  {/* Signout the User */}
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {avatarContent}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">{user?.email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action="/stripe" method="GET">
                  <button className="flex w-full items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </button>
                </form>
              </DropdownMenuItem>

            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => signOut()}>  {/* Signout the User */}
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
