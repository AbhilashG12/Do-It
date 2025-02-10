const mongoose = require("mongoose");
const { Schema } = mongoose;

const frndShip = new Schema({
    user1: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
  user2: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
    },
  status: { 
    type: String, 
    enum: ['accepted'], 
    required: true 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
    }
} ,{timestamps:true})

frndShip.index({ user1: 1, user2: 1 }, { unique: true });
frndShip.index({ user2: 1, user1: 1 }, { unique: true });

const Frndship = mongoose.model("Frndship" ,frndShip )
module.exports = Frndship;