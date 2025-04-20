const express=require('express');
require('dotenv').config();
const cors=require('cors');
const connectMongoDb=require('./connection');
const electionAnalysisRouter=require('./router/election_analysis');
const electionPredictionnRouter=require('./router/election_prediction');
const LeaderAnalysisRouter=require('./router/leader_analysis');

const app=express();

app.use(cors({
  origin: 'https://client-inky-six.vercel.app'  
}));


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

app.use('/api/election_analysis',electionAnalysisRouter);
app.use('/api/election_prediction',electionPredictionnRouter);
app.use('/api/leader_analysis',LeaderAnalysisRouter);


//server
// app.listen(PORT, () => { 
//     console.log(`Server is listening on port ${PORT}`);
// }); 

module.exports=app;
