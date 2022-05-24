const express = require('express');
const cors = require('cors');
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
        const reviewCollection = client.db('manufacturer_factory').collection('reviews');

        app.get('/part', async (req, res) => {
            const query = {};
            const cursor = partCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const part = await partCollection.findOne(query);
            res.send(part);
        });
        app.post('/review', async (req, res) => {
            const reviews = req.body;
            const query = { rating: reviews.rating, description: reviews.description }
            const review = await reviewCollection.insertOne(query);
            res.send(review);
        })

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
