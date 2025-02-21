const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.e8jg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    console.log("Connected to MongoDB!");

    const UserCollection = client.db("tastManagement").collection("users");
    const TaskCollection = client.db("tastManagement").collection("tasks");

    // User Insert or Find API
    app.post('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const user = req.body;
        console.log(user);
        try {
          // Check if user already exists
          const isExist = await UserCollection.findOne(query);
          if (isExist) {
            return res.status(200).json(isExist); // User already exists
          }

          // Insert new user
          const result = await UserCollection.insertOne({
            name: user.name || "Unknown",
            image: user.image || "default.png",
            email: user.email,
           
          });

          res.status(201).json(result); // Successfully added new user

        } catch (error) {
          console.error("MongoDB Error:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
    });
    // add task
    app.post('/tasks',async (req,res)=>{
        const data= req.body
        console.log(data);
        const result = TaskCollection.insertOne(data)
        res.send(result)
    })

    app.get('/tasks',async(req,res)=>{
        const result = await TaskCollection.find().toArray();
        res.send(result)
      })

    //   delete task
    app.delete('/tasks/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await TaskCollection.deleteOne(query);
        res.send(result)
      })

      //update

     app.put('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const { title, description, category } = req.body;

  try {
    const result = await TaskCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, category } }
    );
    if (result.matchedCount > 0) {
      res.status(200).send({ message: 'Task updated successfully' });
    } else {
      res.status(404).send({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error updating task' });
  }
});



  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

// Default Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
