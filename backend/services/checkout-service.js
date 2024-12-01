import { pool } from '../db/pool.js';
import { CheckoutModel } from '../models/checkout-model.js';

class CheckoutService {

    static async isComplete(customerId) {
        const { shippingAddress, paymentId }
            = await CheckoutModel.getSession(pool, customerId);

        return shippingAddress !== null && paymentId !== null;
    }
}

export {
    CheckoutService,
}