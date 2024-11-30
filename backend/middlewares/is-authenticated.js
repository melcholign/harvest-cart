export function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.status(401).json({
        error: 'customer must log in to access this feature',
    });
}