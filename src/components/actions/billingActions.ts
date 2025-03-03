'use server'

import { createClient } from "@supabase/supabase-js"
import { createClientServer } from "@/utils/supabase/server"
import { stripe } from '@/lib/stripe'

type BillingResponse = {
    credits: number
    error?: string
}

export async function getUserBilling(): Promise<BillingResponse> {
    try {
        const supabase = createClientServer()


        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
            return {
                credits: 0,
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
                credits: 0,
                error: userError.message
            }
        }

        return {
            credits: userData?.credits || 0
        }

    } catch (err) {
        return {
            credits: 0,
            error: err instanceof Error ? err.message : 'An unexpected error occurred'
        }
    }
}



type PlanResponse = {
    plan: string
    error?: string
}

export async function getUserPlan(): Promise<PlanResponse> {
    try {
        const supabase = createClientServer()
        const stripeD = stripe

        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
            return {
                plan: 'Free Plan',
                error: 'User not authenticated'
            }
        }

        const supabaseService = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        )
        
        const { data: userData, error: userError } = await supabaseService
            .from('user_billing')
            .select('stripe_customer_id')
            .eq('id', data.user.id)
            .single()

        if (userError || !userData?.stripe_customer_id) {
            return {
                plan: 'Free Plan',
                error: 'No billing information found'
            }
        }

        // Get customer's subscriptions
        const subscriptions = await stripeD.subscriptions.list({
            customer: userData.stripe_customer_id,
            status: 'active',
            expand: ['data']
        });

        if (!subscriptions.data.length) {
            return {
                plan: 'Free Plan'
            }
        }

        // Get the product nickname from the first active subscription
        const planNickname = subscriptions.data[0].items.data[0].plan.metadata!.nickname;

        return {
            plan: planNickname || 'Free Plan'
        }
    } catch (error) {
        return {
            plan: 'Free Plan',
            error: 'Error fetching plan details' + error
        }
    }
}

export async function isUserOnFreePlan(): Promise<boolean> {
    const userPlanResponse = await getUserPlan();
    return userPlanResponse.plan === 'Free Plan';
  }