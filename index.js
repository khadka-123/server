const connectMongoDb=require('./connection');
const electionAnalysisRouter=require('./router/election_analysis');
const electionPredictionnRouter=require('./router/election_prediction');
const LeaderAnalysisRouter=require('./router/leader_analysis');
require('dotenv').config();

const express=require('express');
const cors=require('cors');
const app=express();

const corsOptions = {
  origin: 'https://client-inky-six.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Databse connection
const PORT=process.env.PORT;
const URL=process.env.MONGO_URL;
connectMongoDb(URL);

//Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Election API!');
});

app.use('/election_analysis',electionAnalysisRouter);
app.use('/election_prediction',electionPredictionnRouter);
app.use('/leader_analysis',LeaderAnalysisRouter);


//server
// app.listen(PORT, () => { 
//     console.log(`Server is listening on port ${PORT}`);
// }); 

module.exports=app;
