import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { CustomerController } from '../controllers/customer-controller.js';
import { VerificationController } from '../controllers/verification-controller.js';
import { passport } from '../middlewares/passport/passport-config.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';

const router = express.Router();

router.post('/account', createCustomerValidator(), CustomerController.createCustomer);
router.get('/account/verification', isAuthenticated, VerificationController.initiateAccountVerification);
router.post('/account/verification', isAuthenticated, VerificationController.completeAccountVerification);

router.post('/account/login',
    (req, res, next) => { console.log('reached'); next()},
    passport.authenticate('local-customer', { successRedirect: '/success', failureRedirect: '/failure' }),
);
router.post('/account/logout', (res, req) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });
});

export {
    router as customerRouter
};