var jwt = require('jsonwebtoken');
require('dotenv').config()
const SECRET = process.env.KEY_TOKEN
const RF_SECRET = process.env.KEY_RF_TOKEN
const jwtSettings = require('../configs/jwtSettings.configs')

const signToken = async (data) => {
    try {
        let token = jwt.sign(data, SECRET, {
            expiresIn: 24 * 60 * 60 * 365, //24 * 60 * 60, // expires in 24 hours (24 x 60 x 60)
            audience: jwtSettings.AUDIENCE,
            issuer: jwtSettings.ISSUER,
            subject: data.id.toString(), // Thường dùng để kiểm tra JWT lần sau
            algorithm: 'HS512',
        })
        return token
    } catch (error) {
        console.log(error);
    }
}
const signTokenPss = async (data) => {
    try {
        let token = jwt.sign(data, SECRET, {
            expiresIn: 24 * 60 * 60 * 365, //24 * 60 * 60, // expires in 24 hours (24 x 60 x 60)
            audience: jwtSettings.AUDIENCE,
            issuer: jwtSettings.ISSUER,
            subject: data.id.toString(), // Thường dùng để kiểm tra JWT lần sau
            algorithm: 'HS512',
        })
        return token
    } catch (error) {
        console.log(error);
    }
}

const signRfToken = async (data) => {
    try {
        let token = jwt.sign(data, RF_SECRET, {
            expiresIn: 30 * 24 * 60 * 60, //24 * 60 * 60, // expires in 24 hours (24 x 60 x 60)
            audience: jwtSettings.AUDIENCE,
            issuer: jwtSettings.ISSUER,
            subject: data.id.toString(), // Thường dùng để kiểm tra JWT lần sau
            algorithm: 'HS512',
        })
        return token
    } catch (error) {
        console.log(error);
    }
}

const verifyRfToken = async (token) => {
    try {
        let data = jwt.verify(token, RF_SECRET)
        return data
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    signToken,
    signRfToken,
    verifyRfToken,
    signTokenPss
}