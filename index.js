const express = require('express');
const cors = require('cors');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lv4w2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const partCollection = client.db('manufacturer_factory').collection('parts');
        const userCollection = client.db('manufacturer_factory').collection('users');
        const orderCollection = client.db('manufacturer_factory').collection('orders');
        const reviewCollection = client.db('manufacturer_factory').collection('reviews');
        const profileCollection = client.db('manufacturer_factory').collection('profiles');
        // this create payment intent 
        app.post('/create-payment-intent', async (req, res) => {
            const order = req.body;
            const price = order.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                automatic_payment_methods: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })

        })

        // this api for all parts
        app.get('/part', async (req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });
        app.post('/part', async (req, res) => {
            const product = req.body;
            const query = { name: product.name, description: product.description, price: product.price, minimumQuantity: product.minimumQuantity, availableQuantity: product.availableQuantity, image: product.image }
            const result = await partCollection.insertOne(query);
            res.send(result);
        })
        // this api for specific part
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partCollection.findOne(query);
            res.send(part);
        });
        // this api for all user 
        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });
        // this api for make admin
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' }
            };
            const makeAdmin = await userCollection.updateOne(filter, updateDoc);
            res.send(makeAdmin);
        });
        // this api for crete all user and saved the database  
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        // this api for all orders
        app.get('/orders', async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.send(orders);
        });
        // this api for deliver orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deliver = await orderCollection.deleteOne(query);
            res.send(deliver);
        });

        // this api for specific order per email 
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const order = await orderCollection.find(query).toArray();
            res.send(order);
        });
        // this api for specific order 
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })

        // this api for create order
        app.post('/order', async (req, res) => {
            const orders = req.body;
            const query = { name: orders.name, email: orders.email, address: orders.address, phone: orders.phone, productName: orders.productName, price: orders.price, productQuantity: orders.productQuantity, }
            const order = await orderCollection.insertOne(query);
            res.send(order);
        });
        // this api for delete specific order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });
        // this api for get all review
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });
        // this api for create review
        app.post('/review', async (req, res) => {
            const reviews = req.body;
            const query = { name: reviews.name, email: reviews.email, rating: reviews.rating, description: reviews.description, }
            const exists = await reviewCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, reviews: exists });
            }
            else {
                const review = await reviewCollection.insertOne(query);
                return res.send({ success: true, reviews: review });
            }
        });
        // this api for profile info 
        app.post('/profile', async (req, res) => {
            const profiles = req.body;
            const query = { name: profiles.name, email: profiles.email, education: profiles.education, location: profiles.location, phone: profiles.phone, linkedIn: profiles.linkedIn }
            const profile = await profileCollection.insertOne(query);
            res.send(profile);
        });


    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Form The Car Manufacturer Factory')
});

app.listen(port, () => {
    console.log('Car Manufacturer Run On Port', port)
})
