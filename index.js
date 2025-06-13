const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
require('dotenv').config();

// middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.upkmpyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    // COLLECTIONS
    const productsCollection = client.db('tradeNest').collection('products');

     // ADD PRODUCT AND SEND IN THE DATABASE (CREATE)
    app.post('/products', async (req, res) => {
      const newProducts = req.body;
      console.log(newProducts);
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('TRADE NEST SERVER IS RUNNING')
})

app.listen(port, () => {
  console.log(`TRADE NEST is listening on port ${port}`)
})
