const Stripe = require("stripe");
const ServiceRequest = require("../models/ServiceRequest");

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Server misconfigured: STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: "requestId is required" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = String(request.userId) === String(req.user?.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!request.billAmount || Number(request.billAmount) <= 0) {
      return res.status(400).json({ message: "Bill amount not set" });
    }

    const billAmount = Number(request.billAmount);
    // Stripe has a minimum charge amount per currency. For INR, it's typically ₹50.
    if (billAmount < 50) {
      return res.status(400).json({ message: "Bill amount must be at least ₹50 to pay by Stripe" });
    }

    if ((request.paymentStatus || "").toLowerCase() === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const stripe = getStripe();

    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");
    if (!frontendUrl) {
      return res.status(500).json({ message: "Server misconfigured: FRONTEND_URL is not set" });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Service Request (${request.serviceType || "service"})`,
              description: request.message || "Service payment"
            },
            unit_amount: Math.round(billAmount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${frontendUrl}/payment-complete?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-complete?status=cancel&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        requestId: String(request._id)
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const requestId = session?.metadata?.requestId;
    if (!requestId) {
      return res.status(400).json({ message: "Session missing requestId" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = String(request.userId) === String(req.user?.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const paid = session.payment_status === "paid";
    if (paid && (request.paymentStatus || "").toLowerCase() !== "paid") {
      request.paymentStatus = "Paid";
      request.paymentHistory = request.paymentHistory || [];
      request.paymentHistory.push({
        amount: Number(request.billAmount) || 0,
        method: "Stripe",
        date: new Date()
      });
      request.stripeCheckoutSessionId = session.id;
      request.stripePaymentIntentId = session.payment_intent;
      await request.save();
    }

    res.json({
      paymentStatus: paid ? "Paid" : "Unpaid",
      requestId: String(request._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.webhook = async (req, res) => {
  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: "Server misconfigured: STRIPE_WEBHOOK_SECRET is not set" });
    }

    const stripe = getStripe();
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("Stripe webhook received:", event.type);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const requestId = session?.metadata?.requestId;

      console.log("Stripe checkout.session.completed for requestId:", requestId);

      if (requestId) {
        const request = await ServiceRequest.findById(requestId);
        if (request) {
          request.paymentStatus = "Paid";
          request.paymentHistory = request.paymentHistory || [];
          request.paymentHistory.push({
            amount: Number(request.billAmount) || 0,
            method: "Stripe",
            date: new Date()
          });
          request.stripeCheckoutSessionId = session.id;
          request.stripePaymentIntentId = session.payment_intent;
          await request.save();
          console.log("Service request marked Paid:", String(request._id));
        } else {
          console.warn("Service request not found for webhook requestId:", requestId);
        }
      } else {
        console.warn("Stripe session missing metadata.requestId. session.id:", session?.id);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error.message);
    res.status(500).json({ message: error.message });
  }
};
