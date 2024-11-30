import { pool } from '../db/pool.js';
import { PaymentModel } from '../models/payment-model.js';
import { PaymentCardModel } from '../models/payment-card-model.js';
import { CheckoutModel } from '../models/checkout-model.js'
import { OnlineTransactionModel } from '../models/online-transaction-model.js';

class PaymentController {
    // this controller is called to set new payment or existing one
    static async setPayment(req, res, next) {
        const { customerId, checkoutSession: { paymentId, amount } } = req.user;
        const { paymentMethod: newPaymentMethod } = req.body;

        // if no payment option has not been selected.
        if (!paymentId) {
            if (newPaymentMethod === 'cod') {
                const paymentId = await PaymentModel.createPayment(
                    pool, customerId, newPaymentMethod, amount
                );
                await CheckoutModel.setPaymentId(pool, customerId, paymentId);

                return res.status(201);
            }

            if (newPaymentMethod === 'digital') {
                return res.status(202).json({
                    message: 'Digital payment initiated. Please provide additional details.',
                    nextApi: {
                        url: '/customer/checkout/payment/digital',
                        method: 'POST',
                        requiredFields: ['cardType', 'cardNumber', 'cvv', 'expiryDate', 'brand'],
                    },
                });
            }
        }

        // if a payment method is already defined (i.e. a payment is already pending)
        const paymentInfo = await PaymentModel.getPaymentInformation(pool, paymentId);

        // if payment was chosen as digital, but changed to cash-on-delivery
        if (paymentInfo.paymentMethod === 'digital' && newPaymentMethod === 'cod') {
            await OnlineTransactionModel.deleteOnlineTransaction(pool, paymentId);
            await PaymentModel.changePaymentMethod(pool, paymentId, 'cod');
        }

        // if payment was cash-on-delivery, but changed to digital
        if (paymentInfo.paymentMethod === 'cod' && newPaymentMethod === 'digital') {
            return res.status(202).json({
                message: 'Digital payment initiated. Please provide additional details.',
                nextApi: {
                    url: '/customer/checkout/payment/digital',
                    method: 'POST',
                    requiredFields: ['cardType', 'cardNumber', 'cvv', 'expiryDate', 'brand'],
                },
            });
        }
    }

    static async processDigitalPayment(req, res, next) {
        const { customerId, checkoutSession: { paymentId, amount } } = req.user;
        const { cardType, cardNumber, cvv, expiryDate, brand } = req.body;

        let cardId;
        // verify whether card exists
        try {
            const card = await PaymentCardModel.getCardByDetails(
                pool, cardNumber, cardType, cvv, expiryDate, brand
            );
            cardId = card.cardId;
        } catch (err) {
            return res.status(404).json({
                error: 'Wrong card information',
            });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        if (paymentId) {
            try {
                await OnlineTransactionModel.record(connection, cardId, paymentId);
                await PaymentModel.changePaymentMethod(connection, paymentId, 'digital');
            } catch (err) {
                await connection.rollback();
                await connection.release();
                return res.status(400).json({
                    error: err.message,
                });
            }
        } else {
            // create payment
            const newPaymentId = await PaymentModel.createPayment(
                connection, customerId, 'digital', amount
            );

            // whether or not the same payment id is already set
            await CheckoutModel.setPaymentId(connection, customerId, newPaymentId);

            // associate payment with online transaction
            await OnlineTransactionModel.record(connection, cardId, newPaymentId);
        }

        await connection.commit();
        await connection.release();

        res.status(201);
    }
}

export {
    PaymentController,
}