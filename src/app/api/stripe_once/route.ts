import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { createClientServer } from "@/utils/supabase/server"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const priceID = searchParams.get("priceID") || process.env.STRIPE_PRICE_ID;
        const supabase = createClientServer()
        let stripeSession;

        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data?.user) {
            stripeSession = await stripe.checkout.sessions.create({
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                allow_promotion_codes: true, 
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [
                    {
                        price: priceID,
                        quantity: 1,
                    },
                ],
            });
            return NextResponse.redirect(stripeSession.url!, 303);
        }
        
        const { data: userData } = await supabase
            .from('purchases')
            .select('stripe_customer_id')
            .eq('user_email', data.user.email)
            .single();

        if (userData && userData.stripe_customer_id) {
            stripeSession = await stripe.checkout.sessions.create({
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                allow_promotion_codes: true, 
                payment_method_types: ["card"],
                mode: "payment",
                customer: userData.stripe_customer_id,
                line_items: [
                    {
                        price: priceID,
                        quantity: 1,
                    },
                ],
            });
            return NextResponse.redirect(stripeSession.url!, 303);
        }
        
        stripeSession = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: data.user.email || '',
            line_items: [
                {
                    price: priceID,
                    quantity: 1,
                },
            ],
            metadata: {
                userID: data.user.id,
                userEmail: data.user.email || ''
            },
        });
        return NextResponse.redirect(stripeSession.url!, 303);

    } catch (err) {
        return new NextResponse(String(err), { status: 500 });
    }
}