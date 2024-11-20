//import dotenv from 'dotenv';
//import path from 'node:path';
//dotenv.config({ path: path.resolve('.','.env') });

import express from 'express';
import { farmerRouter } from './routes/farmerRouter.js';
import flash from 'express-flash';
import session from 'express-session';


const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

app.set('view-engine', 'ejs');


// using routers
app.use('/farmer', farmerRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The server has started at http://localhost:${PORT}/`);
});