import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const strategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: (_req, _rawToken, done) => done(null, process.env.JWT_SECRET),
  },
  (payload, done) => done(null, payload)
);

passport.use(strategy);

export default passport;
