const fs = require('fs')
const rootPath  = require('app-root-path').path
const path = require('path')
const publicPath = path.join(rootPath,'src','public','uploads')

module.exports = {
    removeDir : async ({collection,id}) => {
        const folderPath = path.join(publicPath,collection,id)
        try {
            await fs.rmdirSync(folderPath,{maxRetries: 3, recursive: true, force: true})
            return true
        }
        catch(err) {
            console.log('delete image failured ::',err);
            return false
        }
    }
}