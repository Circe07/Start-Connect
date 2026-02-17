const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("firebase-functions/logger");
const { db } = require("../config/firebase");
const Payment = require("../models/payment.model");

exports.createCheckoutSession = async (req, res) => {
    try {
        const { cart } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const lineItems = cart.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity || 1,
        }));

        // Create a pending payment record in Firestore
        const paymentData = new Payment({
            userId: req.user ? req.user.uid : "guest",
            amount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
            currency: "eur",
            status: "pending",
            items: cart,
        });

        const paymentRef = await db.collection("payments").add(paymentData.toFirestore());

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cart`,
            metadata: {
                paymentId: paymentRef.id,
            },
        });

        // Update the payment record with the stripe session ID
        await paymentRef.update({ stripeSessionId: session.id });

        res.status(200).json({ url: session.url });
    } catch (error) {
        logger.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        logger.error("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const paymentId = session.metadata.paymentId;

            if (paymentId) {
                try {
                    await db.collection("payments").doc(paymentId).update({
                        status: "completed",
                        updatedAt: new Date(),
                    });
                    logger.info(`Payment successful for session ID: ${session.id}. Order fulfilled.`);
                } catch (error) {
                    logger.error(`Error updating payment status for ID ${paymentId}:`, error);
                }
            } else {
                logger.warn(`No paymentId found in metadata for session ${session.id}`);
            }
            break;
        default:
            logger.info(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
};
