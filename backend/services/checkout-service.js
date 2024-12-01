/**
 * Service to handle checkout-related operations for a customer.
 */
class CheckoutService {

    /**
     * Checks if the checkout process is complete for a given customer.
     * A checkout is considered complete if both the shipping address and payment ID are provided.
     *
     * @param {number} customerId - The ID of the customer.
     * @returns {Promise<boolean>} A promise that resolves to true if checkout is complete, false otherwise.
     * 
     * @example
     * const isComplete = await CheckoutService.isComplete(customerId);
     * console.log(isComplete); // true or false
     */
    static async isComplete(customerId) {
        const { shippingAddress, paymentId }
            = await CheckoutModel.getSession(pool, customerId);

        return shippingAddress !== null && paymentId !== null;
    }
}

export {
    CheckoutService,
}
