import express from 'express';
import bodyParser from 'body-parser';
import v1 from './v1';

const app = express();

app.use(bodyParser.json());
app.use('/v1', v1);

app.listen(3000, () => console.log('Listening...'));
