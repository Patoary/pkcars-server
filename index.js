const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;

    })
    next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5hyer.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const carCollection = client.db('pkCars').collection('products');
        //auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'

            });
            res.send({ accessToken });
        })
        // get all inventory
        app.get('/products', async (req, res) => {
            const query = {};
            const limit = parseInt(req.query.limit);
            const pageNumber = parseInt(req.query.pageNumber);
            const cursor = carCollection.find(query);
            let products;
            if (pageNumber || limit) {
                products = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send(products);
        })

        // find the total kind of product amount
        app.get('/productCount', async (req, res) => {
            const count = await carCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // get eachInventory
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await carCollection.findOne(query);
            res.send(inventory);
        });

        // update quantity
        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body.updateQuantity;
            const filteredProduct = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    quantity: updateQuantity,
                },
            };
            const updatedProduct = await carCollection.updateOne(filteredProduct, updateDoc);
            res.send(updatedProduct);

        });


        // addInventory
        app.post('/addInventory', async (req, res) => {
            const newProduct = req.body;
            const result = await carCollection.insertOne(newProduct);
            res.send(result);
        });

        // delete inventory
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        })


        // filter items according to user for myItem
        app.get('/myitem', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = carCollection.find(query);
                const myItem = await cursor.toArray();
                res.send(myItem)
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })

            }

        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('pkcars connected');
});

app.listen(port, () => {
    console.log(`pkcars on port ${port}`);
});
