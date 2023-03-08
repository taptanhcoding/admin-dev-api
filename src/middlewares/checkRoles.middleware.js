module.exports = {
    checkRoleEffect: async (req,res,next) => {
        const {collection,action} = req.params
        if(req.user.roles.auth[collection].includes(action) && req.user.active) { // vì req.method trả về POST,GET,... nên cấu hình phía model cũng phải viết hoa
            next()

        }
        else{
            return res.status(403).send({
                status: false,
                message: "Bạn không có quyền truy cập dữ liệu"
            })
        }
    },
   
}