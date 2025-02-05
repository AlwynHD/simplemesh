import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


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
        return new NextResponse('Webhook Error: Invalid signature', { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    console.log(session)
    if (event.type === 'checkout.session.completed') {
        // Fulfill the purchase...
        console.log('Payment was successful');
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        console.log(subscription.metadata.userID);
        console.log(subscription.customer);
    }

    return new NextResponse('ok', { status: 200 });

}