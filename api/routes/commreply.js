const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const mongoose = require('mongoose');

const Post = require('../models/post');
const User = require('../models/user');




//getting all comments details
router.get('/getcomment',(req,res,next)=>{
    Post.findOne({"_id":req.body.p_id})
        .sort({'comments.time':-1})
        .limit(4)
        .exec()
        .then(result=>{
            console.log(result);
            return res.json({
                found:true,
                comments: result.comments 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                found:false,
                error: err
            });
        });
});


//adding comments
router.post('/comment/add',checkAuth,(req,res,next)=>{
    var nowtime = new Date;
    //comment object with no reply
    var newcomment = new Object({
        user: {
            profimg:req.UserData.profimg,
            name:req.UserData.username,
            userId:req.UserData.userId
        },	
        time:nowtime,
        cbody:req.body.cbody,
        c_id:mongoose.Types.ObjectId(),
        replies:[]
        
    });

    //finding the post_id and pushing the comment object to it. 
    Post.findOneAndUpdate({ _id:req.body.p_id }, {$push:{ comments: newcomment } }).exec()
        .then(result=>{
            res.json({
                message:"Comment added",
                nc : newcomment
            });
        })
        .catch(err =>{
            res.json({
                message:"Comment cannot be added",
                error:err
            });
        });
     
});


//adding Reply
router.post('/reply/add',checkAuth,(req,res,next)=>{
    var nowtime = new Date;
    //comment object with no reply
    let newreply = {
        touser:req.body.tou,
        fromuser: {
            profimg:req.UserData.profimg,
            name:req.UserData.username,
            userId:req.UserData.userId
        },	
        r_id:mongoose.Types.ObjectId(),
        time:nowtime,
        rbody:req.body.rbody
    };


    //finding the post_id and puching the comment object to it. 
    Post.findOneAndUpdate({ "comments.c_id":req.body.c_id }, { $push:{ "comments.$.replies": newreply }} ).exec()
        .then(result=>{
            res.json({
                message:"Reply added",
                nc : newreply
            });
        })
        .catch(err =>{
            res.json({
                message:"Reply cannot be added",
                error:err
            });
        });
     
});

//deleting the all values
router.delete('/commentdel/all',(req,res,next)=>{
    Post.remove().exec().then(result=>{
        res.json({
            message:result
        });
    })
    .catch(err=>{
        res.json({
            message:err
        });
    });
});

module.exports = router;