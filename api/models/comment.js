const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    postId:{type:String, required:true},
    user:{
            profimg:{type:String},
            name:{type:String},
            userId:{type:String}
        },
    commentBody:{type:String,required:true},    
    replies:[{
            user:{
                profimg:{type:String},
                name:{type:String},
                userId:{type:String}
            },
            replyBody:{type:String},
            time:{type:Date, default:Date.now},
            rate:{type:Number,default:0}
        }],
    rate:{type:Number,default:0},   
    time: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Comment',commentSchema);