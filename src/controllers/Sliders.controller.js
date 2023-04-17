const Sliders = require('../models/Sliders.model')

class SliderController {
    //[GET] /api/sliders
    async getSlidersByClient(req, res, next) {
        try {
            const { type } = req.query
            let number = 0
            let query = { '$and': [{ active: true }] }
            let option = {}
            switch (type) {
                case 'slider':
                    query['$and'].push({ typeSlide: 'slider' })
                    number = 5
                    break;
                case 'slider_right':
                    query['$and'].push({ typeSlide: 'slider_right' })
                    number = 3
                    break;
                case 'slider_left':
                    query['$and'].push({ typeSlide: 'slider_left' })
                    number = 3
                    break;
                case 'banner':
                    query['$and'].push({ typeSlide: 'banner' })
                    number = 1
                    break;
                default:
                    return false
                    break;
            }
            const data = await Sliders.find(query).sort({ _id: -1 }).limit(number)
            return res.send({
                status: true,
                data
            })
        } catch (error) {
            console.log("Lỗi lấy Slider ", error);
            res.status(500).send({
                status: false,
                message: "Lỗi khi lấy slider !"
            })
        }
    }
}


module.exports = new SliderController()