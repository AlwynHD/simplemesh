import { ContentLayout } from "@/components/admin-panel/content-layout";
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
export default async function DashboardPage() {

  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log(error)
    console.log(data)
    redirect('/login')
  }
  return (
    <ContentLayout title="Dashboard">
      <div>Welcome {data.user.email}</div>
    </ContentLayout>
  );
}