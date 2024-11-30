import express from 'express';
import { PaymentController } from '../controllers/payment-controller.js';

const router = express.Router();

router.post('/', PaymentController.setPayment);
router.post('/digital', PaymentController.processDigitalPayment);

export {
    router as PaymentRouter,
}