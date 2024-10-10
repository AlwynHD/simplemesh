"use client"
import { useState } from 'react'
import { reqOTP, verifyotp, SignInWithGoogle } from './actions'

export default function LoginPage() {
    const [email, setEmail] = useState('')

    const handleReqOTP = async (formData: FormData) => {
        const emailValue = formData.get('email') as string
        setEmail(emailValue)
        await reqOTP(formData)
    }

    const handleVerifyOTP = async (formData: FormData) => {
        formData.append('email', email)
        await verifyotp(formData)
    }

    return (
        <>
            <form>
                <label htmlFor="email">Email:</label>
                <input id="email" name="email" type="email" required />
                <button formAction={handleReqOTP}>Send OTP</button>
            </form>
            <form>
                <label htmlFor="otp">OTP:</label>
                <input id="otp" name="otp" />
                <button formAction={handleVerifyOTP}>Verify OTP</button>
            </form>

            <button onClick={SignInWithGoogle}>Sign in With Google</button>
        </>
    )
}