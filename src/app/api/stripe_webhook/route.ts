import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
        
        if (session.payment_status === 'paid') {
            console.log('Payment was successful');
            
            const customerEmail = session.customer_details?.email;
            
            const supabaseService = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_KEY!
            );
            
            const { data: existingUser, error } = await supabaseService
                .from('purchases')
                .select('*')
                .eq('user_email', customerEmail)
                .single();
            
            if (existingUser) {
                await supabaseService
                    .from('purchases')
                    .update({ 
                        credits: existingUser.credits + 30,
                    })
                    .eq('user_email', customerEmail);
                    
                console.log(`Updated existing user: ${customerEmail} with 30 more credits`);
            } else {
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