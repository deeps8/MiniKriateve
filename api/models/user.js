const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email:{
        type: String, 
        required: true, 
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    Eactive:{type:Boolean},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profimg: {type:String },
    about: {type:String, default: 'I am new to Kriateve'},
    notify : {
              notified:{type:Boolean, default:false},
              notifications:{type:Number}
            },
    prizes : [{ 
                position:{type:Number},
                pospath:{type:String},
                contestname:{type:String},
                contestid:{type:String},
                dateofprize:{type:Date}
            }],
    badges: {
                level:{type:Number},
                bpath:{type:String},
                cbadge:{type:String},
                cbpath:{type:String}
            },                
    followers : {type:Number,default:0},
    following : {type:Number,default:0},
    posts : {type:Number,default:0},
    contests :{type:Number,default:0},
    dateofcreation: {type:Date, default:Date.now}
});

module.exports = mongoose.model('User',userSchema);