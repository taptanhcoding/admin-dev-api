const { MongoClient,ObjectId } = require("mongodb");

const DB_URL = "mongodb://localhost:27017/";

function connectMongoDB(dbName) {
  return {
    async insertDocument(data, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .insertOne(data)
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async insertDocuments(data, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .insertMany(data)
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async updateDocument(query, data, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');

            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .updateOne(query, { $set: data })
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) =>{
            console.log('lỗi kết nối::',err);
            return rj(err)});
      });
    },
    async updateDocuments(query, data, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .updateMany(query, { $set: data })
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async deleteDocument(query, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .deleteOne(query)
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async deleteDocuments(query, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .deleteMany(query)
              .then((result) => rs(result))
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async findDocument(query, colectionName) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            colection
              .findOne(query)
              .then((data) => {
                rs(data);
              })
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
    async findDocuments(
      {
        query = null,
        sort = null,
        limit = 50,
        aggregate = [],
        skip = 0,
        projection = null,
      },
      colectionName
    ) {
      return new Promise((rs, rj) => {
        MongoClient.connect(DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
          .then((client) => {
            console.log('Connected successfully to server');
            const DB = client.db(dbName);
            const colection = DB.collection(colectionName);
            if (query) {
              colection = colection.find(query);
            } else {
              colection = colection.aggregate(aggregate);
            }
            if (sort) {
              colection = colection.sort(sort);
            }
            colection.limit(limit).skip(skip);

            if (projection) {
              colection = colection.project(projection);
            }
            colection
              .toArray()
              .then((data) => {
                rs(data);
              })
              .catch((err) => rj(err))
              .finally(() => client.close());
          })
          .catch((err) => rj(err));
      });
    },
  };
}

module.exports = connectMongoDB;
