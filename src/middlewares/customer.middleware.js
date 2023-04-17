const { verifyToken } = require("../helpers/token.helpers");
const { customers } = require("../models/index.model");


async function getUser(req,res,next) {
    if (req.headers.authorization) {

        let token = req.headers.authorization.split(' ')[1];
        let data = null
        try {
          if (!token) return res.send({ status: true ,data: null})
          data = await verifyToken(token)
          if (!data) return res.status(401).send({ status: false, message: 'Token lỗi' })
          const user = await customers.findOne({ $and: [{ _id: data.id }, { active: true }] },{password: 0}).exec()
          req.user = user
        } catch (error) {
          console.log('Looix auth ',error);
          req.user=null
        }
    }
    next()
}


module.exports = {
    getUser
}