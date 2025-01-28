"use server"

import { createClient } from '@/utils/supabase/server'

export async function checkUserAuth(): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    console.log(data)
    return false
  }
  return true
}