"use client"
import { LoginWithLogo } from '@/components/login-components/login-with-logo'


export default function LoginPage() {


    return (
        <div className='flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-[350px] sm:max-w-md'>
                <LoginWithLogo />
            </div>
        </div>
    )
}