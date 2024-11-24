import express from 'express';
import cors from 'cors';
import { sessionStore } from './middlewares/session-store.js';
import { passport } from './middlewares/passport/passport-config.js';

import { customerRouter } from './routes/customer-router.js';
import { basketRouter } from './routes/basket-router.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(sessionStore);
app.use(passport.session());

app.use('/customer', customerRouter);
app.use('/customer/basket', basketRouter);

app.get('/', (req, res) => {
    console.log(req.user);
    res.send('Hello');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`The server has started at http://localhost:${PORT}/`);
});