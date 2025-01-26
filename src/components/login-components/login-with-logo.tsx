'use client'
import { reqOTP, verifyotp, signInWithGoogle } from './login-actions'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FaGoogle } from 'react-icons/fa'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function LoginWithLogo() {
  const [email, setEmail] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [otpValue, setOtpValue] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const handleReqOTP = async (formData: FormData) => {
    const emailValue = formData.get('email') as string
    setEmail(emailValue)
    setIsLoading(true)
    try {
      await reqOTP(formData)
      setIsOtpSent(true)
      setOtpValue('')  
      setError('')
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (formData: FormData) => {
    formData.append('email', email)
    try {
      await verifyotp(formData)
      setError('')
      // Handle successful verification (e.g., redirect to dashboard)
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center space-y-1 pb-2">
        <div className="w-16 h-16 mb-2 relative">
          <Image
            src="/favicon/Logo-Fox-Light.png"
            alt="Fox Logo"
            layout="fill"
            objectFit="contain"
            className="absolute inset-0"
          />
        </div>
        <CardTitle className="text-xl">Welcome to Simple Mesh</CardTitle>
        <CardDescription>
          {isOtpSent ? (
            <div className="text-center">
              We&apos;ve sent a 6-digit code to {email}
            </div>
          ) : "Select an Option Below"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {!isOtpSent ? (
          <form action={handleReqOTP}>
          <div className="flex flex-col space-y-1">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <SubmitButton isLoading={isLoading} />
        </form>
        ) : (
          <form action={handleVerifyOTP}>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="otp" className="text-sm">One-Time Passcode</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)} 
                required
              />
            </div>
            <Button type="submit" className="w-full mt-3">Verify OTP</Button>
            <p className="text-xs mt-2 text-center">
              Didn&apos;t receive the code? <button type="button" onClick={() => setIsOtpSent(false)} className="text-primary hover:underline">Resend OTP</button>
            </p>
          </form>
        )}
      </CardContent>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <CardFooter className="flex flex-col space-y-3 pt-2">
        <Button variant="outline" className="w-full" onClick={() => { signInWithGoogle(); }}>
          <FaGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <p className="text-xs text-center text-muted-foreground px-4">
          By logging in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-primary">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </CardFooter>
    </Card>
  )
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full mt-3" disabled={isLoading || pending}>
      {isLoading || pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Continue
        </>
      ) : (
        'Continue'
      )}
    </Button>
  )
}