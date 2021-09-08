import express from 'express';
import regRouter from './router/reg_router';


const port = 8000;
const app = express();
app.use(express.json());

app.use('/numRegister', regRouter);
app.use('/stringRegister', regRouter);
app.use('/posRegister', regRouter);

app.listen(port, ()=>{
  console.log('http server listening on port '+port);
});
