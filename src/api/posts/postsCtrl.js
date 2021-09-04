import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;

/*
기존 post id 체크하는 미들웨어 

*/

//params의 id로 post를 가져온 뒤 이를 ctx.state.post에 저장함. 
//여기서 post의 id는 유저id가 아니다. 그냥 post의 id일 뿐이다. 
export const getPostById = async (ctx, next)=>{
    const {id} = ctx.params;
    if(!ObjectId.isValid(id)){
        ctx.status=400 ;
        return
    } 
    try {
        const post = await Post.findById(id);
        if(!post){
            ctx.status = 404;
            return 
        }
        ctx.state.post = post;
        return next();
    } catch(e) {
        ctx.throw(500, e);
    }
}

//post 가 유저가 쓴 포스트가 맞는지 확인하는 컨트롤러
//>> post의 유저가 토큰과 일치하는지 확인한다. 

export const checkOwnPost =(ctx, next)=>{
    const {user, post} = ctx.state;
    if(post.user._id.toString()!==user._id){
        ctx.status = 403;
        return;
    }
    return next();
}

//데이터 저장 
/*
post/api/posts
{
    title: '제목,
    body: '내용',
    tags: ['태그1', '태그2']
}
*/

export const write = async ctx=>{
    //Joi로 검증 

    const schema = Joi.object().keys({
        //객체가 다음 필드를 가지고 있음을 검증 
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array()
        .items(Joi.string())
        .required(), //문자열로 이루어진 배열 
    });
    //검증하고 나서 검증 실패인 경우 에러 처리 
    const result = schema.validate(ctx.request.body);
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return ; 
    }
    //기존 코드 그대로 

    const {title, body, tags}=ctx.request.body;
    const post = new Post ({
        title, 
        body,
        tags,
        user: ctx.state.user 
    });
    try {
        await post.save();
        ctx.body=post;
    } catch(e){
        ctx.throw(500,e)
    }
}


//데이터 조회 
// 특정 사용자가 작성한 포스트만 조회하거나 특정 태그가 있는 포스트만 조회하는 기능 
//(블로그에선 필수지 !)
// &tag=&username= 등을 해주면, 
/*
 GET/api/posts
*/
export const list = async ctx => {
    // query는 문자열이기 때문에 숫자로 변환해 주어야 합니다.
    // 값이 주어지지 않았다면 1을 기본으로 사용합니다.
    const page = parseInt(ctx.query.page || '1', 10);
  
    if (page < 1) {
      ctx.status = 400;
      return;
    }
  
    const { tag, username } = ctx.query;
    // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query = {
      ...(username ? { 'user.username': username } : {}),
      ...(tag ? { tags: tag } : {}),
    };
  
    try {
      const posts = await Post.find(query)
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10)
        .lean()
        .exec();
      const postCount = await Post.countDocuments(query).exec();
      ctx.set('Last-Page', Math.ceil(postCount / 10));
      ctx.body = posts.map(post => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));
    } catch (e) {
      ctx.throw(500, e);
    }
  };

//특정 데이터 조회 
/*
GET/api/posts/:id 
 */
export const read= async ctx=>{
    ctx.body = ctx.state.post;
}

//특정 데이터 제거 
/* 
DELETE /api/posts/:id
*/
export const remove = async ctx=>{
    const {id} = ctx.params;
    try{
        await Post.findByIdAndRemove(id).exec();
        ctx.status=204;
    } catch(e){
        ctx.throw(500, e);
    }
}

//데이터 수정
/* 
PATCH /api/posts/:id

{
    title: '수정',
    body: '수정내용',
    tags: ['수정', '태그']
}
*/
export const update = async ctx=>{
    const { id } = ctx.params;
    //required()가 없음 
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, //이 값을 설정하면 업데이트된 데이터를 반환함
            //false일 때는 업데이트 되기 전의 데이터를 반환 
        }).exec();
        if (!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e){
        ctx.throw(500, e);
    }
}

