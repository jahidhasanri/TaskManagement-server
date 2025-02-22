const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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

    const UserCollection = client.db("tastManagement").collection("users");
    const TaskCollection = client.db("tastManagement").collection("tasks");

    // User API endpoints
    app.post('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      try {
        const isExist = await UserCollection.findOne({ email });
        if (isExist) return res.send(isExist);
        
        const result = await UserCollection.insertOne({
          name: user.name || "Unknown",
          image: user.image || "default.png",
          email: user.email,
        });
        res.status(201).send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Task API endpoints
    app.post('/tasks', async (req, res) => {
      try {
        const result = await TaskCollection.insertOne(req.body);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Error creating task" });
      }
    });

    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await TaskCollection.find().toArray();
        res.send(tasks);
      } catch (error) {
        res.status(500).send({ message: "Error fetching tasks" });
      }
    });

    app.delete('/tasks/:id', async (req, res) => {
      try {
        const result = await TaskCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).send({ message: "Task not found" });
        res.send({ message: "Task deleted successfully" });
      } catch (error) {
        res.status(500).send({ message: "Error deleting task" });
      }
    });

    app.put('/tasks/:id', async (req, res) => {
      try {
        const updateData = req.body;
        const result = await TaskCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updateData }
        );
        if (result.matchedCount === 0) return res.status(404).send({ message: "Task not found" });
        
        const updatedTask = await TaskCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.send(updatedTask);
      } catch (error) {
        res.status(500).send({ message: "Error updating task" });
      }
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Task Management Server Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});