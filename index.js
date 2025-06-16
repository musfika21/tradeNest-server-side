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
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // // GET DATA ACCORDING TO CATEGORY
    app.get('/products/category/:category', async (req, res) => {
      const category = (req.params.category);
      const query = { category };
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

    // ADD PRODUCT AND SEND IN THE DATABASE (CREATE)
    app.post('/products', async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
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
    // app.patch('/products/buy/:id', async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    //   const filter = { _id: new ObjectId(id) };
    //   const mainQuantity = { $inc: { BuyQuantity: 1 } };
    //   const result = await productsCollection.updateOne(filter, job);
    //   res.send(result);
    // });

    const ObjectId = require('mongodb').ObjectId;

// HANDLING PRODUCT QUANTITY AFTER BUYING
app.patch('/products/buy/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity, userEmail } = req.body;

    // Validate input
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const filter = { _id: new ObjectId(id) };
    const product = await productsCollection.findOne(filter);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate quantity against minimum_selling_quantity and main_quantity
    if (quantity < product.minimum_selling_quantity) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot be less than ${product.minimum_selling_quantity}`,
      });
    }
    if (quantity > product.main_quantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock',
      });
    }

    // Update main_quantity by decrementing
    const update = { $inc: { main_quantity: -quantity } };

    // Optionally, log purchase details (e.g., in a separate collection)
    await productsCollection.db.collection('purchases').insertOne({
      productId: new ObjectId(id),
      userEmail,
      quantity,
      purchaseDate: new Date(),
    });

    // Perform the update
    const result = await productsCollection.updateOne(filter, update);

    if (result.modifiedCount === 1) {
      return res.json({ success: true, message: 'Purchase successful' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update product quantity' });
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
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
