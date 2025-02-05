import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
// import useUserData from "@/hooks/use-userData";
import { createClient } from "@/utils/supabase/server"

export async function GET() {
    try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()

        if (error || !data?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', data.user.id)
            .single();
        
        if (userData && userData.stripe_customer_id) {
            console.log("User has a stripe customer id")
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userData.stripe_customer_id,
                return_url: `http://localhost:3000/dashboard`,
            });
            return NextResponse.redirect(stripeSession.url!, 303);
        }

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `http://localhost:3000/pricing`,
            cancel_url: `http://localhost:3000/dashboard`,
            payment_method_types: ["card"],
            mode: "subscription",
            customer_email: data.user.email ?? '',
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            // metadata: {
            //     userId: data.user.id,
            // },
            subscription_data: {
                metadata: {
                    userID: data.user.id,
                },
            },
        });
        return NextResponse.redirect(stripeSession.url!, 303);

    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }

}