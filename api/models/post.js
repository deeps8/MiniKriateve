const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    category:{type:String, required:true},
    division:[{type:String, required:true}],
    user:{
            profimg:{type:String},
            name:{type:String},
            userId:{type:String}
        }, 
    postBody:{
            title:{type:String},
            bodyText:{type:String},
            hashtags:{type:String},
            media:[{type:String}],
        },
    rating:{
            emote:{type:String},
            total:{type:Number,default:0},
            ratecount:{type:Number,default:0},
            users:[{
                name:{type:String},
                score:{type:Number}
            }]
        },   
    available:{type:String,default:true},
    forSale:{
            link:{type:String,default:false},
            price:{type:Number}   
    }, 
    time: {type:Date, default:Date.now},
    comments:[{
            c_id: {type:String},
            time: {type:Date},
            user: {
                profimg:{type:String},
                name:{type:String},
                userId:{type:String}
            },	
            cbody:{type:String},
            replies:[{
                r_id: mongoose.Schema.Types.ObjectId,
                time: {type:Date},
                touser: {
                    profimg:{type:String},
                    name:{type:String},
                    userId:{type:String}
                },
                fromuser:{
                    profimg:{type:String},
                    name:{type:String},
                    userId:{type:String}
                },
                rbody:{type:String},
            }]	
    }]
});

module.exports = mongoose.model('Post',postSchema);