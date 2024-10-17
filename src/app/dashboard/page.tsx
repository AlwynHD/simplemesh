import { ContentLayout } from "@/components/admin-panel/content-layout";

import { redirect } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/server'

import Settings from "@/components/settings-overlay/settings";
import Modal from '@/components/modal'


export default async function DashboardPage() {
  // const [isOpen, setIsOpen] = useState(false)

  // const openModal = () => setIsOpen(true)
  // const closeModal = () => setIsOpen(false)
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
        {/* <Settings /> */}
      {/* <button
        onClick={openModal}
        className='absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
      >
        Settings
      </button>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className='w-full max-w-[350px] sm:max-w-md'>
          <Settings />
        </div>
      </Modal> */}
    </ContentLayout>
  );
}