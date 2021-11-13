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
      const haiku5 = database.collection("users");

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

      //GET API FOR USERS
      app.get("/users", async (req, res) => {
        const cursor = haiku5.find({});
        const users = await cursor.toArray();
        res.send(users);
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

      //GET API FOR ADMIN CHECK

      app.get("/user/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await haiku5.findOne(query);
        let isAdmin = false;
        if (user?.role === "admin") {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
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
        const productInfo = req.body;
        const result = await haiku3.insertOne(productInfo);
        res.json(result);
        console.log("[*] Product uploaded to database");
      });
      //POST API FOR REVIEWS
      app.post("/reviews", async (req, res) => {
        const reviews = req.body;
        const result = await haiku2.insertOne(reviews);
        res.json(result);
        console.log("[*] Review uploaded to database");
      });

      //POST API FOR USERS
      app.post("/users", async (req, res) => {
        const users = req.body;
        const result = await haiku5.insertOne(users);
        res.json(result);
        console.log("[*] User uploaded to database");
      });

      //PUT API FOR USERS

      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const option = { upsert: true };
        const update = { $set: user };
        const result = await haiku5.updateOne(filter, update, option);
      });

      // PUT API FOR ADMIN
      app.put("/users/admin", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const update = { $set: { role: "admin" } };
        const result = await haiku5.updateOne(filter, update);
        req.json(result);
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
