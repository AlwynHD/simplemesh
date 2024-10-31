import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client"; // Make sure this is the client-side Supabase client

const useUserData = () => {
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const supabase = createClient();
                const { data, error: authError } = await supabase.auth.getUser();

                if (authError || !data?.user) {
                    setError(authError || new Error('User not found'));
                    return;
                }

                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', data.user.id)
                    .single();

                if (userError) {
                    setError(new Error(userError.message));
                    return;
                }

                const user = {
                    name: userData?.full_name || data.user?.email?.split('@')[0],
                    email: data.user.email || '',
                    avatar: userData?.avatar_url || '/default-avatar.png',
                };

                setUser(user);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return { user, error, isLoading };
};

export default useUserData;