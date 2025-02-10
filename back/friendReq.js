const mongoose = require("mongoose");
const { Schema } = mongoose;

const frndReq = new Schema({
    from: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'User', 
         required: true 
        },
    to: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },
    status: { 
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending' },
    sentAt: { 
        type: Date, 
        default: Date.now
         },
    respondedAt: { 
        type: Date
    }
} ,{timestamps:true})

const FriendReq = mongoose.model("FriendReq" , frndReq);
module.exports = FriendReq;