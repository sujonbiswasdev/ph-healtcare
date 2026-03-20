import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { stripe } from "../../config/stripe.config";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(async (req : Request, res : Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
     if(!signature || !webhookSecret){
        console.error("Missing Stripe signature or webhook secret");
        return res.status(400).json({message : "Missing Stripe signature or webhook secret"})
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error : any) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(400).json({message : "Error processing Stripe webhook"})
    }

     try {
        const result = await PaymentService.handlerStripeWebhookEvent(event);

        sendResponse(res, {
            status:200,
            success : true,
            message : "Stripe webhook event processed successfully",
            data : result
        })
    } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        sendResponse(res, {
            status:500,
            success : false,
            message : "Error handling Stripe webhook event",
        })
    }
})

export const PaymentController = {
    handleStripeWebhookEvent
}