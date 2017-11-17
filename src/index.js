import express from 'express';
import bodyParser from 'body-parser';
import v1 from './v1';
import models from './models';
import SocketService from './v1/services/socket-service';

const app = express();
SocketService.init(app);

app.use(bodyParser.json());
app.use('/v1', v1);

export default app;
