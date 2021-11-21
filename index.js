const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();



const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucxei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);


async function run() {
    try {
      await client.connect();
      const database = client.db("travelDB");
      const serviceCollection = database.collection("services");
      const orderCollection = database.collection('orders');


      // get api 

      app.get('/services',async(req,res)=>{
        const cursor = serviceCollection.find({});
        const services = await cursor.toArray();
        res.send(services);

      })


      // GET single api 
      app.get('/services/:id',async(req,res)=>{
        const id= req.params.id;
        const query ={_id: ObjectId(id)};
        console.log('get id')
        const result = await serviceCollection.findOne(query);
        res.json(result);

      })

      
      
      // post api

      app.post('/services',async(req,res)=>{
         const service = req.body; 
         console.log('hit',service);
          const result = await serviceCollection.insertOne(service);
          res.json(result);
        //   console.log(result)
        // res.send('post hitted')
      })
      
       //Order

       app.get('/orders', async (req, res) => {
        const cursor = orderCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);

    })

       app.post('/orders', async (req, res) => {
        const order = req.body;
        order.createdAt = new Date();
        const result = await orderCollection.insertOne(order);
        res.json(result);
    })
    
        //Update Api

        app.get('/orders/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const user = await orderCollection.findOne(query);

          console.log('load user with id', id);
          res.json(user);
      });

      

      app.put('/orders/:id', async (req, res) => {

        const id = req.params.id;
        console.log('updating user', req)
        const updateData = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                status: updateData.status

            },
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    })


     //Update booking status
     app.patch('/orders/:id', (req, res) => {
      orderCollection.updateOne({ _id: ObjectId(req.params.id) },
          {
              $set: { status: req.body.status }
          })
          .then(result => {
              res.send(result.modifiedCount > 0)
          })
  })
      // delete api 

      app.delete('/orders/:id',async(req,res)=>{
        const id= req.params.id;
        const query ={_id: ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result);
      })
      
    } 
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('running')
})

app.listen(port,()=>{
    console.log('on port', port)
})