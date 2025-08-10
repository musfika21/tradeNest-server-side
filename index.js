require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const admin = require("firebase-admin");
const cors = require('cors');
const port = process.env.PORT || 3000;

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

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// const verifyFirebaseToken = async (req, res, next) => {
//   const authHeader = req.headers?.authorization

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).send({ message: 'unauthorized access' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = await admin.auth().verifyIdToken(token)
//     req.decoded = decoded;
//     next();
//   } 
//   catch (error) {
//     return res.status(401).send({ message: 'unauthorized access' });

//   }
// }

// const verifyTokenEmail = async (req, res, next) =>{
//   if(req.query.email !== req.decoded.email){
//         return res.status(401).send({ message: 'unauthorized access' });
//   }
// }

async function run() {
  try {

    // await client.connect();

    // COLLECTIONS
    const productsCollection = client.db('tradeNest').collection('products');
    const purchaseCollection = client.db('tradeNest').collection('purchase');

    // GET ALL PRODUCTS FROM DATABASE IN SERVER
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray()
      res.send(result);
    });

    // SINGLE PRODUCT DETAILS GET FROM THE DATABASE 
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // // GET DATA ACCORDING TO CATEGORY
    app.get('/category/:category', async (req, res) => {
      const category = (req.params.category);
      const query = { category_slug: category };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // MY POSTED PRODUCT'S
    app.get('/my-Products', async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // MY PURCHASE PRODUCT'S FROM THE DATABASE
    app.get('/my-Purchase', async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await purchaseCollection.find(query).toArray();
      res.send(result);
    });

    // ADD PRODUCT AND SEND IN THE DATABASE (CREATE)
    app.post('/products', async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    // ADD PURCHASE PRODUCT IN THE DATABASE
    app.post('/purchase', async (req, res) => {
      const newPurchase = req.body;
      const result = await purchaseCollection.insertOne(newPurchase);
      res.send(result);
    });


    // UPDATE SINGLE PRODUCT DATA
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;
      const updatedDoc = {
        $set: updatedProduct
      }
      const result = await productsCollection.updateOne(filter, updatedDoc, options);
      res.send(result);

    });

    // HANDLING PRODUCT QUANTITY AFTER BUYING
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const { buyQuantity } = req.body;
      console.log(buyQuantity)
      console.log(typeof (buyQuantity))

      try {
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { main_quantity: buyQuantity } }
        );
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    });

    // DELETE PRODUCT FROM DATABASE
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // DELETE PURCHASE FROM DATABASE
    app.delete('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await purchaseCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error('Error in DELETE /purchase:', error);
        res.status(500).send({ error: 'Internal server error' });
      }
    });

    // await client.db("admin").command({ ping: 1 });
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