"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RotateCw, Laptop, AlertCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

// Define allowed paths that can be accessed on any device
const RESTRICTED_PATHS = [
  '/dashboard/image-3d',
  '/dashboard/text-3d',

]
export function MobileAccessRestriction() {
  const [open, setOpen] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Determine if current path is restricted
  const isRestrictedPath = RESTRICTED_PATHS.some(path => pathname.startsWith(path))
  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === 'undefined') return

      const portrait = window.innerHeight > window.innerWidth
      const isMobile = window.innerWidth < 768

      setIsPortrait(portrait)
      setIsMobileDevice(isMobile)
      setOpen(isMobile && portrait && isRestrictedPath)
    }

    checkDevice()

    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [isRestrictedPath, pathname])

  const handleRedirectToDashboard = () => {
    router.push('/dashboard')
    setOpen(false)
  }

  if (!isRestrictedPath) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Only allow closing if no longer in portrait mode or no longer on restricted path
        if (!isPortrait || !isRestrictedPath) {
          setOpen(value)
        }
      }}
    >
      <DialogContent hideCloseButton className="sm:max-w-sm p-6 rounded-xl max-w-sm">
      <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-full p-3 mb-2">
            <RotateCw
              className="h-7 w-7 text-orange-400"/>
          </div>
          <DialogTitle className="text-lg font-semibold">Limited Mobile Experience</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-3 py-3">
          <p className="text-muted-foreground text-sm">
            This section works best on tablet or desktop devices. You can rotate your phone to landscape mode, but some features may be difficult to use.
          </p>
          <div className="flex items-center justify-center text-yellow-500 my-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium text-sm">For optimal experience, use a larger device</span>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <div className="flex flex-col items-center">
              <RotateCw className="h-5 w-5 text-gray-400" />
              <span className="text-xs mt-1">Rotate</span>
            </div>
            <div className="flex flex-col items-center">
              <Laptop className="h-5 w-5 text-gray-400" />
              <span className="text-xs mt-1">Desktop</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={handleRedirectToDashboard}
            className="w-full"
            variant="outline"
            size="sm"
          >
            Return to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MobileAccessRestriction;