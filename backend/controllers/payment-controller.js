import { pool } from '../db/pool.js';
import { PaymentModel } from '../models/payment-model.js';
import { PaymentCardModel } from '../models/payment-card-model.js';
import { CheckoutModel } from '../models/checkout-model.js';
import { OnlineTransactionModel } from '../models/online-transaction-model.js';

/**
 * @classdesc Controller handling payment operations such as setting payment method,
 * processing digital payments, and handling cash-on-delivery (COD) scenarios.
 */
class PaymentController {

    /**
     * Sets or updates the payment method for the customer during checkout.
     * Handles both new payments and updates to existing ones.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The next middleware function.
     */
    static async setPayment(req, res, next) {
        const { customerId, checkoutSession: { paymentId, amount } } = req.user;
        const { paymentMethod: newPaymentMethod } = req.body;

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

        const paymentInfo = await PaymentModel.getPaymentInformation(pool, paymentId);

        if (paymentInfo.paymentMethod === 'digital' && newPaymentMethod === 'cod') {
            await OnlineTransactionModel.deleteOnlineTransaction(pool, paymentId);
            await PaymentModel.changePaymentMethod(pool, paymentId, 'cod');
        }

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

    /**
     * Processes the digital payment by verifying card details and updating transaction records.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Function} next - The next middleware function.
     */
    static async processDigitalPayment(req, res, next) {
        const { customerId, checkoutSession: { paymentId, amount } } = req.user;
        const { cardType, cardNumber, cvv, expiryDate, brand } = req.body;

        let cardId;
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
            const newPaymentId = await PaymentModel.createPayment(
                connection, customerId, 'digital', amount
            );

            await CheckoutModel.setPaymentId(connection, customerId, newPaymentId);
            await OnlineTransactionModel.record(connection, cardId, newPaymentId);
        }

        await connection.commit();
        await connection.release();

        res.status(201);
    }
}

export { PaymentController };
