const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // GET ALL PRODUCTS FROM DATABASE IN SERVER
    app.get('/products', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email }; // Use the correct field name you're storing
      }
      const result = await productsCollection.find(query).toArray(); // 👈 now using the query
      res.send(result);
    });

    // SINGLE PRODUCT DETAILS GET FROM THE DATABASE 
    app.get('/products/:id', async(req, res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // MY POSTED PRODUCT'S
    app.get('/my-Products', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

    // ADD PRODUCT AND SEND IN THE DATABASE (CREATE)
    app.post('/products', async (req, res) => {
      const newProducts = req.body;
      console.log(newProducts);
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });
    

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
