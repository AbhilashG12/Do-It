const mongoose = require("mongoose");
const {Schema} = mongoose;

const todoSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  room: { type: String, required: true } 
})

module.exports = mongoose.model("Todo" , todoSchema)