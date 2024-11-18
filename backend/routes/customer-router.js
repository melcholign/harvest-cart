import express from 'express';
import createCustomerValidator from '../validators/customer/customer-validator.js';
import { customerCreateController } from '../controllers/customer-controller.js';

const router = express.Router();

router.post('/create', createCustomerValidator(), customerCreateController);

export default router;