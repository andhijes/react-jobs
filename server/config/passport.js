require('dotenv').config()
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const {ExtractJwt} = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('../models/user')




// check JSON WEB TOKEN
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_SECRET
}, async(payload, done) =>{
    try{
        // find user from token
        const user = await User.findById(payload.sub)
        // !user
        if(!user){
            return done(null, false)
        }else{
            // user
            done(null, user)
        }
    }catch(error){
        done(error, response)
    }
}))

// google strategy
// passport.serializeUser((user, done) => {
//     done(null, user);
// });
// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/user/auth/google/callback",
    passReqToCallback   : true,
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async(request, accessToken, refreshToken, profile, done) => {
      try {
          
            // const user = {
            //     id: profile.id,
            //     name: profile.displayName,
            //     email: profile.emails[0].value,
            //     emailVerified: profile.emails[0].verified,
            //     accessToken: accessToken
            // };  
            // return done(null, user);
        // We're in the account creation process
        let existingUser = await User.findOne({ "google.id": profile.id });
        // console.log(existingUser)
        if (existingUser) {
            return done(null, [existingUser, accessToken]);
        }

        // Check if we have someone with the same email
        existingUser = await User.findOne({ "local.email": profile.emails[0].value })
        if (existingUser) {
            // We want to merge google's data with local auth
            existingUser.methods.push('google')
            existingUser.google = {
                id: profile.id,
                email: profile.emails[0].value
            }
            await existingUser.save()
            return done(null, [existingUser, accessToken]);
        }

        const newUser = new User({
            methods: ['google'],
            google: {
            id: profile.id,
            email: profile.emails[0].value
            }
        });

        console.log(newUser)
    
        await newUser.save();
        done(null, [newUser, accessToken]);

      } catch (error) {
          done(error, false, error.message)
      }
  }
));

// LOCAL STARTEGY
passport.use( new LocalStrategy({
    usernameField: 'email'
}, async(email, password, done)=>{
    try {
        const user = await User.findOne({"local.email": email});
        console.log(user);
        
        if(!user){
            return done(null, false)
        }

        const isMatch = await user.isValidPassword(password)
        if(!isMatch){
            return done(null, false)
        }

        done(null, user)
    } catch (error) {
        done(error, false)
    }
}))


//   function (request, accessToken, refreshToken, profile, done) {  
//     const user = {
//         id: profile.id,
//         name: profile.displayName,
//         email: profile.emails[0].value,
//         emailVerified: profile.emails[0].verified,
//         accessToken: accessToken
//       };  
//     return done(null, user);
//   }
