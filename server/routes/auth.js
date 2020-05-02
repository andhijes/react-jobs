const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');
const passportConf = require('../config/passport')


const userController = require('../controllers/user')

router.route('/google/secrets')
    .get(passport.authenticate('google', function(err, user) {
        if(err) {
          // redirect to login page
          console.log('google callback error: '+err);
        } else {
          console.log('google credentials');
          console.log(user);
        }
      }), userController.oauth)

module.exports = router;

