import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; //use this for RLS BYPASS

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

    } catch (err) {
        if (err instanceof Error) {
            console.log(`Webhook Error: ${err.message}`);
        } else {
            console.log('Webhook Error: Unknown error');
        }
        return new NextResponse('Webhook Error: Invalid signature', { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Ensure payment was successful
        if (session.payment_status === 'paid') {
            console.log('Payment was successful');
            
            const customerEmail = session.customer_details?.email;
            
            // Initialize Supabase client with service key for RLS bypass
            const supabaseService = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_KEY!
            );
            
            // Check if user exists in purchases table
            const { data: existingUser, error } = await supabaseService
                .from('purchases')
                .select('*')
                .eq('user_email', customerEmail)
                .single();
            
            if (existingUser) {
                // User exists, update their credits
                await supabaseService
                    .from('purchases')
                    .update({ 
                        credits: existingUser.credits + 30,
                    })
                    .eq('user_email', customerEmail);
                    
                console.log(`Updated existing user: ${customerEmail} with 30 more credits`);
            } else {
                // User doesn't exist, create a new record
                await supabaseService
                    .from('purchases')
                    .insert([
                        {
                            user_email: customerEmail,
                            credits: 30
                        }
                    ]);
                    
                console.log(`Created new user: ${customerEmail} with 30 credits`);
            }
        }
    }

    return new NextResponse('ok', { status: 200 });
}