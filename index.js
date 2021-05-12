const express = require('express');
const roteador = require('./routes');


const app = express();
app.use(express.json());
app.use(roteador);

app.listen(8000);