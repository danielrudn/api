import express from 'express';
import bodyParser from 'body-parser';
import v1 from './v1';
import models from './models';

const app = express();

app.use(bodyParser.json());
app.use('/v1', v1);

if (process.env.NODE_ENV === 'test') {
  app.listen(3000, () => console.log('Listening...'));
} else {
  models.sequelize.sync().then(() => {
    app.listen(3000, () => console.log('Listening...'));
  });
}

export default app;
