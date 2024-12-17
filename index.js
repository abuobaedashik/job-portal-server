const express = require('express')
const cors = require('cors')
const app =express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 3000 

// middleware 
app.use(cors())
app.use(express.json())


// database connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g1qcw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {
    // job collection 
    const JobCollection = client.db('JobsDB').collection('jobs')
    // application collection
    const ApplicationCollection = client.db('JobsDB').collection('application')

    app.get('/jobs',async(req,res)=>{
       const cursor =JobCollection.find()
       const result =await cursor.toArray();
       res.send(result)
    })

    app.get('/jobs/:id',async(req,res)=>{
      const id =req.params.id
      const queary = { _id: new ObjectId(id)}
      const result =await JobCollection.findOne(queary)
      res.send(result)
    })

   
    app.post('/job_application', async (req, res) => {
      const application = req.body;
      console.log(application);
      const result = await ApplicationCollection.insertOne(application);
      res.send(result); 
    });

    // job appliction by email
    app.get('/job_application',async(req,res)=>{
      const email =req.query.email;
      const queary ={user_email: email}
      const result =await ApplicationCollection.find(queary).toArray()
      // fokira way to connet with job and application 
      for(const application of result){
        console.log(application.job_id);
        const appQuery = { _id: new ObjectId(application.job_id)}
        const appResult =await JobCollection.findOne(appQuery)
        if (appResult) {
          application.title =appResult.title
          application.jobType =appResult.jobType
          application.company_logo =appResult.company_logo
          application.category =appResult.category
          application.company =appResult.company
          application.location =appResult.location
          application.applicationDeadline =appResult.applicationDeadline
        }
      }
      res.send(result)
    })
    

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





// basic setup 
app.get('/',(req,res)=>{
    res.send("Job portal server is running ")
})

app.listen(port,(req,res)=>{
    console.log(`Job portal server is running on --,${port}`);
})