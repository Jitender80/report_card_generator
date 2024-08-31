const mongoose = require("mongoose");


const CollegeSchema = new mongoose.Schema({
    college : {type: String, required: true},
    university : {type: String, required: true},    
    
});

const College = mongoose.model("College", CollegeSchema);

module.exports = College