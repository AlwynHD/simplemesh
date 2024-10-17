import { ContentLayout } from "@/components/admin-panel/content-layout";
import Settings from "@/components/settings-overlay/settings";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    console.log(error);
    console.log(data);
    redirect('/login');
  }

  return (
    <ContentLayout title="Settings">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <Settings />
        </div>
      </div>
    </ContentLayout>
  );
}
