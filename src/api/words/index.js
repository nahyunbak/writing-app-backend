import Router from 'koa-router';
import * as wordsCtrl from './wordsCtrl';

const words = new Router();

words.get('/', wordsCtrl.getRequestType, wordsCtrl.generateRandomWords);


export default words;