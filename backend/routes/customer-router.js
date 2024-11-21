import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { CustomerController } from '../controllers/customer-controller.js';
import { passport } from '../middlewares/passport/passport-config.js';

const router = express.Router();

router.post('/create', createCustomerValidator(), CustomerController.createCustomer);

router.post('/login',
    passport.authenticate('local-customer', { successRedirect: '/', failureRedirect: '/' }),
);
router.post('/logout', (res, req) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });
});

export default router;