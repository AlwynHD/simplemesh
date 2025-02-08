import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
// import useUserData from "@/hooks/use-userData";
import { createClientServer } from "@/utils/supabase/server"
export async function GET(request: Request) {
    try {
        const supabase = createClientServer()
        const { data, error } = await supabase.auth.getUser()
        if (error || !data?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        //get priceID from request
        const { searchParams } = new URL(request.url);
        const priceID = searchParams.get("priceID") || process.env.STRIPE_PRICE_ID;


        //get stripeID from user_billing table
        const { data: userData, error: userError } = await supabase
            .from('user_billing')
            .select('stripe_customer_id')
            .eq('id', data.user.id)
            .single();


        let stripeSession;

        if (userData && userData.stripe_customer_id) {
            // The user already has a Stripe customer record.
            // List subscriptions for this customer.
            const subscriptions = await stripe.subscriptions.list({
                customer: userData.stripe_customer_id,
                status: 'all', // This will list all subscriptions regardless of status.
            });

            // Find any subscription that is active or in trial.
            const activeSubscription = subscriptions.data.find(
                (sub) => sub.status === 'active' || sub.status === 'trialing'
            );

            if (activeSubscription) {
                // The user has an active subscription.
                // Redirect them to the Billing Portal.
                console.log("User has an active subscription")
                stripeSession = await stripe.billingPortal.sessions.create({
                    customer: userData.stripe_customer_id,
                    return_url: `http://localhost:3000/dashboard`,
                });
            } else {
                // The user does not have an active subscription.
                // Create a new Checkout Session using the existing customer.
                console.log("User has a stripe customer id but no active subscription")
                stripeSession = await stripe.checkout.sessions.create({
                    success_url: `http://localhost:3000/pricing`,
                    cancel_url: `http://localhost:3000/dashboard`,
                    payment_method_types: ["card"],
                    mode: "subscription",
                    customer: userData.stripe_customer_id, // Reuse existing customer.
                    line_items: [
                        {
                            price: priceID,
                            quantity: 1,
                        },
                    ],
                    subscription_data: {
                        metadata: {
                            userID: data.user.id,
                        },
                    },
                });
            }
        } else {
            // The user doesn't have a stored Stripe customer.
            // Create a new Checkout Session with their email to generate a customer.
            console.log("User does not have a stripe customer id")
            const { searchParams } = new URL(request.url);
            const priceID = searchParams.get("priceID") || process.env.STRIPE_PRICE_ID;
            stripeSession = await stripe.checkout.sessions.create({
                success_url: `http://localhost:3000/pricing`,
                cancel_url: `http://localhost:3000/dashboard`,
                payment_method_types: ["card"],
                mode: "subscription",
                customer_email: data.user.email ?? '',
                line_items: [
                    {
                        price: priceID,
                        quantity: 1,
                    },
                ],
                subscription_data: {
                    metadata: {
                        userID: data.user.id,
                    },
                },
            });
        }
        return NextResponse.redirect(stripeSession.url!, 303);


        // if (userData && userData.stripe_customer_id) {
        //     console.log("User has a stripe customer id")
        //     const stripeSession = await stripe.billingPortal.sessions.create({
        //         customer: userData.stripe_customer_id,
        //         return_url: `http://localhost:3000/dashboard`,
        //     });
        //     return NextResponse.redirect(stripeSession.url!, 303);
        // }


        // const stripeSession = await stripe.checkout.sessions.create({
        //     success_url: `http://localhost:3000/pricing`,
        //     cancel_url: `http://localhost:3000/dashboard`,
        //     payment_method_types: ["card"],
        //     mode: "subscription",
        //     customer_email: data.user.email ?? '',
        //     line_items: [
        //         {
        //             price: priceID,
        //             quantity: 1,
        //         },
        //     ],
        //     // metadata: {
        //     //     userId: data.user.id,
        //     // },
        //     subscription_data: {
        //         metadata: {
        //             userID: data.user.id,
        //         },
        //     },
        // });
        // return NextResponse.redirect(stripeSession.url!, 303);



    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }

}