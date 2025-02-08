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

        const { data: userData, error: userError } = await supabase
            .from('user_billing')
            .select('stripe_customer_id')
            .eq('id', data.user.id)
            .single();

        console.log(userData)
        if (userData && userData.stripe_customer_id) {
            console.log("User has a stripe customer id")
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userData.stripe_customer_id,
                return_url: `http://localhost:3000/dashboard`,
            });
            return NextResponse.redirect(stripeSession.url!, 303);
        }

        const { searchParams } = new URL(request.url);
        console.log(searchParams)
        const priceID = searchParams.get("priceID") || process.env.STRIPE_PRICE_ID;
        console.log(priceID)

        const stripeSession = await stripe.checkout.sessions.create({
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