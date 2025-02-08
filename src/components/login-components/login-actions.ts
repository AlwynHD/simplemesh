'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClientServer } from '@/utils/supabase/server'

export async function reqOTP(formData: FormData) {
  const supabase = createClientServer()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
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

}

export async function verifyotp(formData: FormData) {
  const supabase = createClientServer()
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

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = createClientServer();
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
  console.log(data.url)
  redirect(data.url);
}

export async function signOut() {
  const supabase = createClientServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}