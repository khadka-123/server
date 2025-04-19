const express=require('express')
const router=express.Router();
const handleLeaderAnalysis = require('../controller/leader_analysis');


router.get('',handleLeaderAnalysis)

module.exports=router;