import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello!');
});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log('The server has started at http://localhost:3000/');
});