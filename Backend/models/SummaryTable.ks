import mongoose from "mongoose"
import { report } from "process";



const Summary =  new mongoose.Schema({

    reportId: {  type: mongoose.Schema.Types.ObjectId, ref: "FinalReport", required: true },

    levelSummary:  {
        level: { type: String, required: true },  
    
    
        levelAverage: {
          "Poor (Bad) Questions": {
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Very Difficult Question": {
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Difficult Question": {
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Good Question": {
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Easy Question": {
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Very Easy Question":{
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Total Accepted":{
            number  : { type: Number },
            percentage: { type: Number },
          },
          "Total Rejected":{
            number  : { type: Number },
            percentage: { type: Number },
          },
        }
    
    },
    
    CourseNameSummary: 
    {
      level: { type: String, required: true },  
    
    
      levelAverage: {
        "Poor (Bad) Questions": {
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Very Difficult Question": {
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Difficult Question": {
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Good Question": {
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Easy Question": {
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Very Easy Question":{
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Total Accepted":{
          number  : { type: Number },
          percentage: { type: Number },
        },
        "Total Rejected":{
          number  : { type: Number },
          percentage: { type: Number },
        },
      }
    
    },
    

})

module.exports = mongoose.model("Summary", Summary);