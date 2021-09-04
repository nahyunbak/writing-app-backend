require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router'
import api from './api';
import bodyParser from 'koa-bodyparser';
import  mongoose from 'mongoose';
import jwtMiddleware from './lib/jwtMiddleware';

const {PORT, MONGO_URI} = process.env;


mongoose.connect(MONGO_URI, {useNewUrlParser: true, useFindAndModify: false})
.then(()=>{
    console.log('connected to MongoDB');
})
.catch(e=>{
    console.error(e)
})


const app=new Koa();
const router = new Router();

//라우터 설정 
router.use('/api', api.routes());

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser({ extended: true }));
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

//[PST가 지정되어 있지 않다면 4000을 사용 
const port =PORT||4000;

app.listen(port, ()=>{
    console.log('Listening to port %d', port);
})