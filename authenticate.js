var passport = require('passport');
// const user = require('./models/user');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
const config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
}


exports.jwtPassport = passport.use(new JwtStrategy({
    jwtFromRequest: req => req.signedCookies.token,
    secretOrKey: config.secretKey
}, (jwt_payload, done) => {
    console.log("JWT Payload: ", jwt_payload);
    User.findOne({_id: jwt_payload._id}, (err, user) => {
        if(err) {
            return done(err, false);
        }
        else if(user) {
            return done(null, user)
        }
        else{
            return done(null, false);
        }
    });
}));


exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin) {
        return next();
    }
    else{
        var err = new Error('You are not authorized to perform this operation');
        err.status = 403;
        return next(err);
    }
}
