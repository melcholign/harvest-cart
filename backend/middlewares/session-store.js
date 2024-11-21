import session from 'express-session';

const options = {
    secret: 'cat',
    resave: false,
    saveUninitialized: false,
};
const sessionStore = session(options);

export { sessionStore };