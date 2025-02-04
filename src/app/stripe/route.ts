import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import useUserData from "@/hooks/use-userData";
import { createClient } from "@/utils/supabase/server"

export async function GET() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }


    
}