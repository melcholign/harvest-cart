//import dotenv from 'dotenv';
//import path from 'node:path';
//dotenv.config({ path: path.resolve('.','.env') });
import express from 'express';
import flash from 'express-flash';
import cors from 'cors';
import path from 'path';
import { sessionStore } from './middlewares/session-store.js';
import { passport } from './middlewares/passport/passport-config.js';
import { customerRouter } from './routes/customer-router.js';
import { basketRouter } from './routes/basket-router.js';
import { checkoutRouter } from './routes/checkout-router.js';
import { farmerRouter } from './routes/farmerRouter.js';
import { storeRouter } from './routes/storeRouter.js';
import { productRouter } from './routes/productRouter.js';
import { genericProductRouter } from './routes/generic-product-router.js';

const app = express();
app.set('view engine', 'ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(sessionStore);
app.use(passport.session());
app.use(flash());

// serving static img files
app.use('/src', express.static(path.join('.', 'src')));

// using routers
app.use('/customer', customerRouter);
app.use('/customer/basket', basketRouter);
app.use('/customer/checkout', checkoutRouter);
app.use('/farmer', farmerRouter);
app.use('/farmer/store', storeRouter);

// using dynamic routers
app.use('/farmer/store', productRouter);
app.use('/products', genericProductRouter);

app.get('/', (req, res) => {
    console.log(req.user);
    res.json({
        message: 'Hello',
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`The server has started at http://localhost:${PORT}/`);
});