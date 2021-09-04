/* 토큰을 검증하자 미들웨어로 !*/
/* 만약 유저가 있다면 그 사람은 로그인중인 것이다. */
/*ctx.state.user로 유저 정보를 가져올 수 있다. */

import jwt from 'jsonwebtoken';
import User from '../models/user';

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 이후 '미들웨어'에서 사용하게 하고 싶을 경우 
    //포스트 유저의 id 와 이 유저의 id를 비교한다던가. 
    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };

    // 토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true,
      });
    }
    return next();
} catch (e) {
    // 토큰 검증 실패
    return next();
  }
};

export default jwtMiddleware;