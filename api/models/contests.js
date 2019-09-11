const mongoose = require('mongoose');

const contestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    division:[{type:String, required:true}],
    category:{type:String},
    user:{
            profimg:{type:String},
            name:{type:String},
            userId:{type:String}
        }, 
    contestBody:{
            title:{type:String},
            bodyText:{type:String},
            rules:[{type:String}]
        },
    time: {type:Date, default:Date.now},
    contestStart: {type:Date},
    contestEnd: {type:Date},
    evaluationtime: {type:Date},    
    votes: {type:Number,default:0 },  
    con_id:{type:String},
    subs:{type:Number,default:0}, 
    submissions:[{
        sub_id:{type:String},
        participant:{
            profimg:{type:String},
            name:{type:String},
            userId:{type:String}
        },
        position:{type:Number,default:0},
        time: {type:Date, default:Date.now},
        title:{type:String},
        media:[{type:String}],
        rating:{
            prevrate:{type:Number,default:0},
            total:{type:Number,default:0},
            ratecount:{type:Number,default:0} 
        },
        whorated:[{
            value:{type:String},
            profimg:{type:String},
            name:{type:String},
            userId:{type:String}
        }],
    }], 
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

module.exports = mongoose.model('Contest',contestSchema);