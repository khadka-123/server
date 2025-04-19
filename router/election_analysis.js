const express=require('express')
const router=express.Router();
const { handleElectionAnalysis } = require('../controller/election_analysis');


router.get('/:party',handleElectionAnalysis)

module.exports=router;