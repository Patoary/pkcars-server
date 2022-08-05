const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
