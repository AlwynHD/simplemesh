"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"



export default async function Page() {

  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    console.log(data)
    redirect('/login')
  }

  return (
    <div>
      Hello
    </div>
  )
}
