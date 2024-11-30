import { CheckoutModel } from '../models/checkout-model.js';
import { pool } from '../db/pool.js';

export function blockDuringCheckout(req, res, next) {
    if (req.user.checkoutSession) {
        return res.sendStatus(403);
    }

    next();
}

export async function getCheckoutSession(req, res, next) {
    const checkoutSession = await CheckoutModel.getSession(pool, req.user.customerId);

    if (checkoutSession) {
        req.user.checkoutSession = checkoutSession;
    }

    next();
}