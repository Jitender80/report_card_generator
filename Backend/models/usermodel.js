const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role:{type:String,required:true,enum:['manager','teacher'],default:'teacher'},
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'class' }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;