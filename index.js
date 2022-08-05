const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5hyer.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        await client.connect();
        const carCollection = client.db('pkCars').collection('products');

        // get all inventory
        app.get('/products', async(req,res) =>{
            const query = {};
            const cursor = carCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        // get eachInventory
        app.get('/inventory/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const inventory = await carCollection.findOne(query);
            res.send(inventory); 
        });

        // update quantity
        app.patch('/update/:id', async (req, res) =>{
            const id = req.params.id;
            const updateQuantity = req.body.updateQuantity;
            const filteredProduct = {_id:ObjectId(id)};
            const updateDoc = {
                $set:{
                    quantity: updateQuantity,
                },
            };
            const updatedProduct = await carCollection.updateOne(filteredProduct, updateDoc);
            res.send(updatedProduct);

        })

    }
    finally{
        
    }
}
 run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('pkcars connected');
});

app.listen(port, () =>{
    console.log(`pkcars on port ${port}`);
});
