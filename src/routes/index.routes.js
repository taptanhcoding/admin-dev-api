const adminRoute = require('./admin.routes')
const apiRoute = require('./api.routes')
function routes(app) {
    app.use('/api/',apiRoute)
    app.use('/admin/',adminRoute)
}

module.exports = routes