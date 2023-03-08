const {client} = require('../configs/redis.configs')

module.exports = {
    addDocumentsToRes: async(collection,data) => {
        try {
            await client.set(collection, JSON.stringify([data]));
            return true
        } catch (error) {
            console.log(error);
            return false
        }
    }
}