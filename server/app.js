require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require("mongoose");
const passport = require('passport');
const app = express()
const port = 5000

// app.use(passport.initialize());
// app.use(passport.session());

// db start
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_HOST,  { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Successfully connected to the database");    
    }).catch(err => {
        console.log('Could not connect to the database.', err);
        process.exit();
    });

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// db end


// middleware
app.use(morgan('dev'))
app.use(bodyParser.json())

// router
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')

// route
app.use('/user', userRouter);
app.use('/auth', authRouter);



app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

module.exports = app;
