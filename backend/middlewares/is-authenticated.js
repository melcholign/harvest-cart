/**
 * Middleware to ensure that the user is authenticated before allowing access to the route.
 * 
 * If the user is authenticated, the request proceeds to the next middleware or handler.
 * If not, the middleware responds with a 401 status and an error message.
 *
 * @function isAuthenticated
 * @param {Object} req - The request object, which should contain user authentication details.
 * @param {Object} res - The response object used to send the response if authentication fails.
 * @param {Function} next - The next middleware function to be called if authentication is successful.
 * @returns {Object} A response with a 401 status if authentication fails, or passes control to the next middleware if authentication succeeds.
 */
export function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(401).json({
        error: 'customer must log in to access this feature',
    });
}
