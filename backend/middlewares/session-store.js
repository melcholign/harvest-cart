import session from 'express-session';

/**
 * Configures and initializes the session middleware for express.
 * @module sessionStore
 */

/**
 * Options object for the session middleware.
 * 
 * @constant
 * @type {Object}
 * @property {string} secret - Secret key used for signing the session ID cookie.
 * @property {boolean} resave - Determines whether the session should be saved back to the session store.
 * @property {boolean} saveUninitialized - Controls whether to save uninitialized sessions.
 */
const options = {
    secret: 'cat',
    resave: false,
    saveUninitialized: false,
};

/**
 * Session store middleware configured with the specified options.
 * This middleware is used to manage sessions within an Express app.
 * 
 * @type {function}
 */
const sessionStore = session(options);

export { sessionStore };
