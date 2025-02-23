//authenticate user
//check if they have enough credits
//minus the credits
//run image3D Model from replicate
'use server'
import { createClientServer } from '@/utils/supabase/server'
import { createClient } from "@supabase/supabase-js"


export async function image3D() {
    try {
        const supabase = createClientServer()

        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
            return {
                error: 'User not authenticated'
            }
        }

        const supabaseService = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        )

        const { data: userData, error: userError } = await supabaseService
            .from('user_billing')
            .select('credits')
            .eq('id', data.user.id)
            .single()

        if (userError) {
            return {
                error: userError.message
            }
        }

        if (userData?.credits < 35) {
            return {
                error: 'Not enough credits'
            }
        }
        const updatedCredits = userData.credits - 35

        const { data: updateData, error: updateError } = await supabaseService
            .from('user_billing')
            .update({ credits: updatedCredits })
            .eq('id', data.user.id)
        
        return {
            updatedCredits
        }



    } catch (err) {


    }


}
