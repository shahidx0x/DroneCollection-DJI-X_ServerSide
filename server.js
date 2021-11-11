const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 4000;
const app = express();
require("dotenv").config();

//MIDDLEWARE SETUP

app.use(cors());
app.use(express.json());

// SERVER STATUS

app.get("/", (req, res) => {
  res.status(200).send("Server Running [OK]");
});

//LISTENING PORT

app.listen(port, () => {
  console.log("[*] Listening to port ", port);
});

//MONGODB CONNECTION AND CONFIGUREING API

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/${process.env.DB_TARGET_DB}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION DEBUGING

client.connect((err) => {
  if (err === undefined) {
    console.log("[*] Database Connected Successfully.");
  } else {
    console.error("[*] Database Connection Failed.");
  }

  // SETING UP API

  async function run() {
    try {
      await client.connect();
      const database = client.db("ass12");
      const haiku2 = database.collection("reviews");
      const haiku3 = database.collection("products");
      const haiku4 = database.collection("allorders");


      //GET API FOR PRODUCTS

      app.get("/products", async (req, res) => {
        const cursor = haiku3.find();
        const products = await cursor.toArray();
        res.send(products);
      });

      //GET API FOR REVIEWS

      app.get("/reviews", async (req, res) => {
        const cursor = haiku2.find();
        const reviews = await cursor.toArray();
        res.send(reviews);
      });
      
          //GET API FOR ORDERINFO
      app.get("/placeorder", async (req, res) => {
        const cursor = haiku4.find({});
        const allorders = await cursor.toArray();
        res.send(allorders);
      });

      //GET SINGLE PRODUCTS

      app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        console.log("[*] Getting single service id", id);
        const query = { _id: ObjectId(id) };
        const products = await haiku3.findOne(query);
        res.json(products);
      });
      
        //GET SINGLE ORDER INFO
      app.get("/placeorder/:id", async (req, res) => {
        const id = req.params.id;
        console.log("[*] Getting single service id", id);
        const query = { _id: ObjectId(id) };
        const orderInfo = await haiku4.findOne(query);
        res.json(orderInfo);
      });
      
            //POST API FOR ORDER INFO
      app.post("/placeorder", async (req, res) => {
        const orderInfo = req.body;
        const result = await haiku4.insertOne(orderInfo);
        res.json(result);
        console.log("[*] Service uploaded to database");
      });
          //POST API FOR SERVICES
      app.post("/products", async (req, res) => {
        const serviceInfo = req.body;
        const result = await haiku3.insertOne(serviceInfo);
        res.json(result);
        console.log("[*] Service uploaded to database");
      });
      
            //DELETE API
      app.delete("/placeorder/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await haiku4.deleteOne(query);
        console.log("deleteing user with id", result);
        res.json(result);
      });

    } finally {
      // await client.close();
    }
  }
  run().catch(console.dir);
});
