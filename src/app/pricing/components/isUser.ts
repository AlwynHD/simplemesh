"use server"

import { createClientServer } from '@/utils/supabase/server'

export async function checkUserAuth(): Promise<boolean> {
  const supabase = createClientServer()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    console.log(data)
    return false
  }
  return true
}