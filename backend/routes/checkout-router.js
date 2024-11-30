import express from 'express';
import { BasketController } from '../controllers/basket-controller.js';
import { CheckoutController } from '../controllers/checkout-controller.js';
import { PaymentRouter } from './payment-router.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';

const router = express.Router();

router.use(isAuthenticated);

router.use('/payment', PaymentRouter);

router.get('/', BasketController.proceedToCheckout, CheckoutController.startCheckout);
router.delete('/', CheckoutController.abortCheckout);
router.post('/shipping-address', CheckoutController.setShippingAddress);

export {
    router as checkoutRouter,
}