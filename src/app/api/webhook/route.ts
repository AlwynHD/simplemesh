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


    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        console.log('Payment was successful');
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
            .from('user_billing')
            .update({ stripe_customer_id: subscription.customer })
            .eq('id', subscription.metadata.userID);
        console.log(subscription.metadata.userID);
        console.log(subscription.customer);

        console.log('Payment was successful');
        
        const priceId = subscription.items.data[0].price.id;
        let credits = 0;
        if (priceId === 'price_1Qlr2FCcCkxwgwE8Q3hZmzZ8') {
            credits = 1000;
        } else if (priceId === 'price_1QpDdwCcCkxwgwE8UJd7R42A') {
            credits = 2500;
        } else if (priceId === 'price_1R1dFzCcCkxwgwE88AGetiKp') {
            credits = 10000;
        }
        
        await supabaseservice
            .from('user_billing')
            .update({ 
                stripe_customer_id: subscription.customer,
                credits: credits 
            })
            .eq('id', subscription.metadata.userID);

    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_create') {
            return new NextResponse('ok', { status: 200 });
        }
        const subscriptionId = invoice.subscription;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);

        const priceId = subscription.items.data[0].price.id;

        let credits = 0

        if (priceId === 'price_1R1UlDCcCkxwgwE8lQhnxKdP') {
            credits = 1000;
        } else if (priceId === 'price_1R1UlHCcCkxwgwE8i0BdR3su') {
            credits = 2500;
        }
        else if (priceId === 'price_1R1dFzCcCkxwgwE88AGetiKp') {
            credits = 10000;
        }

        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
            .from('user_billing')
            .update({ credits: credits })
            .eq('stripe_customer_id', subscription.customer);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
      
        const stripeCustomerId = subscription.customer;

        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
          .from('user_billing')
          .update({ credits: 0 })
          .eq('stripe_customer_id', stripeCustomerId);
      
      }

    return new NextResponse('ok', { status: 200 });

}