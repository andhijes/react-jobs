require('dotenv').config()
const User = require('../models/user')
const JWT = require('jsonwebtoken')

const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();


const url = require('url');


// create token
signToken = (user) => {
    return JWT.sign({
        iss:'ApiTest',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 1)
    }, process.env.JWT_SECRET)
}

module.exports = {
    signUp: async(req, res, next) => {
        const {email, password} = req.value.body;

        // check unique email
        const foundUser = await User.findOne({"local.email": email})
        if(foundUser){
            return res.status(403).json({
                success: false,
                message: 'email already used',
                data: null
            })
        }

        // cretae new user
        const newUser = User({
            methods: 'local',
            local: {
                email:email,
                password:password
            }
        })
        await newUser.save()

        // create token
        const token = signToken(newUser)

        // response with token (will)
        return res.json({
            success: true,
            message: 'user created',
            data: {
                email: newUser.local.email
            },
            token: token
        })
    },

    signIn: async(req, res, next) => {
        if(req.user.id){
            const token = signToken(req.user)
            return res.status(200).json({
                success: true,
                message: 'signin success',
                data: {
                    email: req.user.email
                },
                token: token
            })
        }
    },

    secret: async(req, res, next) => {
        if(req.user.id){
            let email;
            if(req.user.methods.includes('local')){
                email = req.user.local.email
            }else{
                email = req.user.google.email
            }
            return res.status(200).json({
                success: true,
                message: 'get access secret',
                data: {
                    email: email
                }
            })
        }
    },

    googleOAuth: async (req, res, next) => {
        const token = signToken(req.user[0]);

        return res.status(200).json({
            success: true,
            message: 'get access secret',
            data: req.user[0],
            tokenGoogle: req.user[1],
            tokenJWT: token
        })
    },

    googleTokenJwt: async(req, res, next) => {
        const token = req.body.access_token
        oauth2Client.setCredentials({access_token: token});
        
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        oauth2.userinfo.get(
            async(err, response) => {
                try {
                    let existingUser = await User.findOne({ "google.id": response.data.id });
                    const token = signToken(existingUser);
                    return res.status(200).json({
                        success: true,
                        message: 'get access secret',
                        token: token
                    })
                } catch (error) {
                    return res.status(401).json({
                        success: false,
                        message: 'unauthorized',
                    })
                }
            }
        );
    },

    oauth: async(req, res, next) => {
        return res.status(200).json({
            success: true,
            message: 'get access secret',
        })
    },

    
}


        // var url_parts = url.parse(req.url, true);
        // var query = url_parts.query;
        // const code = query.code
        // console.log(query)
                // user = {
        //     id: response.data.id,
        //     name: response.data.name,
        //     email: response.data.email,
        //     emailVerified: response.data.verified_email,
        //     accessToken: token
        // }