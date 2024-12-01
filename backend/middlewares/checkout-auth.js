/**
 * Middleware to block access to certain routes if the user is already in a checkout session.
 * 
 * If the user has a checkout session, the middleware responds with a 403 status to prevent access.
 * If not, it passes control to the next middleware.
 * 
 * @function blockDuringCheckout
 * @param {Object} req - The request object, containing user session data.
 * @param {Object} res - The response object used to send a 403 status if the user is in checkout.
 * @param {Function} next - The next middleware function to be called if no checkout session exists.
 * @returns {Object} A response with a 403 status if the user is in checkout, or passes control to the next middleware otherwise.
 */
export function blockDuringCheckout(req, res, next) {
    if (req.user.checkoutSession) {
        return res.sendStatus(403);
    }

    next();
}

/**
 * Middleware to retrieve and attach the checkout session to the user object.
 * 
 * This function fetches the current checkout session from the database and attaches it to the `req.user.checkoutSession` object.
 * It then passes control to the next middleware or route handler.
 * 
 * @function getCheckoutSession
 * @param {Object} req - The request object, which will be updated with the checkout session.
 * @param {Object} res - The response object, not used in this function.
 * @param {Function} next - The next middleware function to be called after the checkout session is attached.
 * @returns {void} Calls the `next` middleware with the updated `req.user`.
 */
export async function getCheckoutSession(req, res, next) {
    const checkoutSession = await CheckoutModel.getSession(pool, req.user.customerId);

    if (checkoutSession) {
        req.user.checkoutSession = checkoutSession;
    }

    next();
}
