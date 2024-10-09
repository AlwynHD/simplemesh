'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    //   const data = {
    //     email: formData.get('email') as string,
    //     password: formData.get('password') as string,
    //   }
    const email = formData.get('email') as string
    //   const { error } = await supabase.auth.signInWithPassword(data)
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            // set this to false if you do not want the user to be automatically signed up
            shouldCreateUser: true,
        },
    })
    console.log(data)

    if (error) {
        console.log(error)
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function verifyotp(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const otp = formData.get('otp') as string

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const { data: { session }, error, } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
    })


    if (error) {
        redirect('/error')
    }

    revalidatePath('/private', 'layout')
    redirect('/private')
}

export async function SignInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  
    if (error) {
      console.log(error);
      redirect("/error");
    }
  
    redirect(data.url);
  }