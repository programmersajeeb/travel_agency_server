const express = require('express');
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxa3e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel_agency');
        const blogStore = database.collection('blogs');
        const newBlogStore = database.collection('newBlogs');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orderProducts');
        const ratingCollection = database.collection('rating');

        // GET API ALL BLOGS
        app.get('/blogs', async(req,res)=>{  
        const cursor = blogStore.find({});
        const blogs = await cursor.toArray();
        res.send(blogs);
        });

    

        //POST API ADD BLOGS
        app.post('/blogs', async(req, res) =>{
        const newBlogs = req.body;
        const result = await blogStore.insertOne(newBlogs);
        res.json(result);
        });

        // GET SINGEL BLOGS
    app.get('/blogs/:id', async (req, res) => { 
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const blog = await blogStore.findOne(query);
        res.json(blog);
    });

    // DELETE API BLOGS
    app.delete('/blogs/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await blogStore.deleteOne(query);
        res.json(result);
    })

    // ============================================

    // GET API ALL BLOGS
    app.get('/newBlogs', async(req,res)=>{
        const cursor = newBlogStore.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        let newBlogs;
        const count = await cursor.count();
        if(page){
            newBlogs = await cursor.skip(page*size).limit(size).toArray();
        }else{
            newBlogs = await cursor.toArray();
        };
      //   const newBlogs = await cursor.toArray();
        res.send({
            count,
            newBlogs
        });
      }); 

        //POST API ADD BLOGS
        app.post('/newBlogs', async(req, res) =>{
            const newClientBlogs = req.body;
            const result = await newBlogStore.insertOne(newClientBlogs);
            res.json(result);
            });

            // GET SINGEL BLOGS
    app.get('/newBlogs/:id', async (req, res) => { 
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const newClientBlogs = await newBlogStore.findOne(query);
        res.json(newClientBlogs);
    });


    // DELETE API CLIENT BLOGS
    app.delete('/newBlogs/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await newBlogStore.deleteOne(query);
        res.json(result);
    })


    // =================================================

    app.get('/users/:email', async (req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin});
      })
    
      // Firebase to database save data post api
      app.post('/users', async (req, res)=>{
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.json(result);
      });
    
      // Make Admin
      app.put('/users/admin', async(req, res) =>{
        const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
      })


    //   ===========================================================

    //ORDER GET API
  app.get('/orderProducts', async(req, res)=>{
    const email = req.query.email;
    const query = {email: email};
    const cursor = orderCollection.find(query);
    const orderProducts = await cursor.toArray();
    res.json(orderProducts);
  })
    // ORDER POST API
    app.post('/orderProducts', async(req, res) =>{
      const orderProduct = req.body;
      const result = await orderCollection.insertOne(orderProduct);
      res.json(result);
    })

    // DELETE ORDER
    app.delete('/orderProducts/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.json(result);
    })

    // ========================================================

    //RATING GET API
   app.get('/rating', async(req,res)=>{  
    const cursor = ratingCollection.find({});
    const rating = await cursor.toArray();
    res.send(rating);
  });

  //RATING POST API
  app.post('/rating', async(req, res) =>{
    const newRatings = req.body;
    const result = await ratingCollection.insertOne(newRatings);
    res.json(result);
  });



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World')
});
app.listen(port, () => {
    console.log('running server on port', port);
})