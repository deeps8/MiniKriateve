const mongoose = require('mongoose');

const notifySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    towhom:{type:String},
    fromwhom:{type:String},
    notificationBody:{type:String},   
    time: {type:Date, default:Date.now}
});

module.exports = mongoose.model('Notify',notifySchema);