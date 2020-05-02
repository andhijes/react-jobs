const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../config/passport')

const passportJWT = passport.authenticate('jwt', {session:false})
const passportSignIn = passport.authenticate('local', {session: false})

const userController = require('../controllers/user')
const {validateBody, schemas} = require('../helpers/routeHelper')


router.route('/signup')
    .post(validateBody(schemas.authSchema), userController.signUp)

router.route('/signin')
    .post(validateBody(schemas.authSchema), passportSignIn, userController.signIn)

router.route('/secret')
    .post(passportJWT, userController.secret)

router.route('/auth/google')
    .get(passport.authenticate('google', {scope: ['email', 'profile']}))

router.route('/auth/google/callback')
    .get(passport.authenticate( 'google', { 
        failureRedirect: '/',
        session:false
      }), userController.googleOAuth)

router.route('/auth/google/token')
    .post(userController.googleTokenJwt)


module.exports = router;

// app.get('/auth',passport.authenticate('google',{
//     scope:['profile','email']
// }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google'));


// app.get('/auth/google',
//   passport.authenticate('google', { scope: 
//       [ 'https://www.googleapis.com/auth/plus.login',
//       , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
// ));

// app.get( '/auth/google/callback', 
//     passport.authenticate( 'google', { 
//         successRedirect: '/auth/google/success',
//         failureRedirect: '/auth/google/failure'
// }));

