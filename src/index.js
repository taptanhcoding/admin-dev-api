const express = require('express')
const morgan  = require('morgan')
const rootPath = require('app-root-path').path
const path = require('path')
const app = express()
const cors = require('cors')
const createError = require('http-errors')
const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
require('dotenv').config()
const PORT = process.env.PORT || 8080

const routes = require('./routes/index.routes')
const connectDB = require('./configs/connectDb.configs')
const collections  =require('./models/index.model')
const {connectRedis} = require('./configs/redis.configs')
const {client} = require('./configs/redis.configs')

app.use(morgan('combined'))
app.use(express.static(path.join(rootPath,'src','public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
    origin: "*"
}))

const jwtSettings = require("./configs/jwtSettings.configs");
const Employees = require('./models/Employees.model')

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtSettings.SECRET;
opts.audience = jwtSettings.AUDIENCE;
opts.issuer = jwtSettings.ISSUER;

passport.use(new JwtStrategy(opts,async function(jwt_payload, done) {
    const oldToken = await client.get('token')
    if(oldToken) {
        collections[jwt_payload.type].findOne({id: jwt_payload.sub},{password: 0}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }else {
        return done(null, false)
    }
}));

connectRedis()
connectDB()
routes(app)

app.use((err,req,res,next) => {
    next(createError.InternalServerError())
})

app.listen(PORT,() => {
    console.log('connect success to port :::',PORT);
})