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


    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        // Fulfill the purchase...
        console.log('Payment was successful');
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
            .from('user_billing')
            .update({ stripe_customer_id: subscription.customer })
            .eq('id', subscription.metadata.userID);
        console.log(subscription.metadata.userID);
        console.log(subscription.customer);
    }

    //every time user pays successfully including the first one
    //so we need to add credits here
    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);

        const priceId = subscription.items.data[0].price.id;

        let credits = 0

        if (priceId === 'price_1Qlr2FCcCkxwgwE8Q3hZmzZ8') { //personal
            credits = 1000;
        } else if (priceId === 'price_1QpDdwCcCkxwgwE8UJd7R42A') { //pro
            credits = 2500;
        }
        else if (priceId === 'price_1QpDhYCcCkxwgwE8RizApTLU') { //enterprise
            credits = 10000;
        }

        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
            .from('user_billing')
            .update({ credits: credits })
            .eq('stripe_customer_id', subscription.customer);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object; // the deleted subscription object
      
        // Assuming you use Stripe's customer id as the key in your DB:
        const stripeCustomerId = subscription.customer;

        // Update the user's record to set credits to 0
        const supabaseservice = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
        await supabaseservice
          .from('user_billing')
          .update({ credits: 0 })
          .eq('stripe_customer_id', stripeCustomerId);
      
      }

    return new NextResponse('ok', { status: 200 });

}