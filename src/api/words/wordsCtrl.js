import Place from '../../models/place';
import Job from '../../models/job';
import Emotion from '../../models/emotion';


/* 
GET /api/words
{
    현대: 'TRUE', 
    판타지: "FALSE", 
    중세: 'TRUE", 
    감정: '긍정적', 
    배경 개수: 3, 
    감정 개수: 2, 
    직업 개수: 4
}
클라이언트 측에서 선택하지 않았을 경우 false 
ctx.status= 400: 전부 입력하지 않음. 
*/
export const getRequestType = async(ctx, next) =>{
    let {modern, fantasy, middle, emotion, placeNumber, jobNumber, emotionNumber} = ctx.request.query;
    if (!placeNumber) {
        placeNumber=3
    }
    if (!jobNumber) {
        jobNumber=3
    }
    if (!emotionNumber) {
        emotionNumber=3
    }

    try {
        ctx.state.modernRequestType = {
            현대: modern, 
        };
        ctx.state.middleRequestType = {
            중세: middle, 
        };
        ctx.state.fantasyRequestType = {
            판타지: fantasy, 
        };
        ctx.state.emotionRequestType = {
            종류: emotion, 
        };
        ctx.state.requestPlaceNumber=placeNumber
        
        ctx.state.requestJobNumber=jobNumber
        
        ctx.state.requestEmotionNumber=emotionNumber
        
        return next();
    }
    catch(e){
        ctx.throw(500, e);
    }
}


/* 
GET /api/words
{
    현대: 'TRUE', 
    판타지: "FALSE", 
    중세: 'TRUE"
}
ctx.status= 400: 전부 입력하지 않음. 
*/
export const generateRandomWords = async(ctx)=>{
    const {modernRequestType, middleRequestType, fantasyRequestType, emotionRequestType, requestPlaceNumber, requestJobNumber, requestEmotionNumber} = ctx.state;

    try {
        const place = await Place.aggregate(
            [ 
                {
                    $match: { $or: [modernRequestType, middleRequestType, fantasyRequestType]}
                },
                { 
                    $sample: { size: parseInt(requestPlaceNumber) } 
                } 
            ]
         )

         const job = await Job.aggregate(
            [ 
                {
                    $match: { $or: [modernRequestType, middleRequestType, fantasyRequestType]}
                },
                { 
                    $sample: { size: parseInt(requestJobNumber) } 
                } 
            ]
         )

         const emotion = await Emotion.aggregate(
            [ 
                {
                    $match: emotionRequestType
                },
                { 
                    $sample: { size: parseInt(requestEmotionNumber) } 
                } 
            ]
         )
         ctx.body ={
             place, 
             job, 
             emotion
         }
    } 
    catch(e){
        ctx.throw(500, e);
    }
}


/*
export const test = async(ctx)=>{
    const {requestType, requestPlaceNumber} = ctx.state;
    if(!requestType) {
        ctx.status=400;
        return 
    }
    try {
        const place = await Place.aggregate(
            [ 
                {
                    $match:requestType
                },
                { 
                    $sample: { size: parseInt(requestPlaceNumber) } 
                } 
            ]
         )
         ctx.body ={
             place, 
             requestType, 
             requestPlaceNumber
             
         }
    } 
    catch(e){
        ctx.throw(500, e);
    }
}

*/