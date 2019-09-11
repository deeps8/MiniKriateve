const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');
const mongoose = require('mongoose');

const Post = require('../models/post');
const User = require('../models/user');

//storage and filename of media uploaded 
const storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null, './uploads/postmedia');
    },
    filename: function(req, file, callback) {
        let fileName = '';
        
        var postmediaExt = file.originalname.split('.');
        fileName += new Date().getTime();
        fileName += "."+postmediaExt[postmediaExt.length-1];
        callback(null, fileName);
    }
});

const upload = multer({storage: storage});



//getting all posts details
router.get('/all/:category/:filter',(req,res,next)=>{
    Post.find({"category":req.params.category})
        .sort({'time':-1})
        .exec()
        .then(result=>{
            if(req.params.filter === "toprated")
                result = result.sort((a,b)=> (b.rating.total - a.rating.total)&&(b.rating.ratecount - a.rating.ratecount));
            result = result;
            return res.json({
                posts: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});


//getting perticular posts details with filters
router.get('/:category/:division',(req,res,next)=>{
    Post.find({"category":req.params.category,"division":{$in:[req.params.division]} })
        .sort({'time':-1})
        .exec()
        .then(result=>{
            result = result.sort((a,b)=> (b.rating.total - a.rating.total)&&(b.rating.ratecount - a.rating.ratecount));            
            return res.json({
                posts: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});

//getting a post details of perticular users only (PROFILE)
router.post('/auser',(req,res,next)=>{
    
    console.log(req.body.name);
    Post.find({'user.name':req.body.name})
        .sort({'time':-1})
        .exec()
        .then(result=>{
            //console.log(result);
            return res.json({
                message: "Ok",
                pu: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});

//adding posts
router.post('/add',checkAuth,upload.array('postMedia[]',5),(req,res,next)=>{
    
      var filepath=[];
      if(req.files.length === 0)
         {   
             
            }
        else{
            req.files.forEach(element => {
                filepath.push(element.path);
            });
        }    
     //console.log(req.files);
        var divs = req.body.division.split(',');
    //post object
    const newPost= new Post({
        _id: new mongoose.Types.ObjectId(),
        category: req.body.category,
        division: divs,
        user: {
            profimg:req.UserData.profimg,
            name:req.UserData.username,
            userId:req.UserData.userId
        },
        postBody:{
            title:req.body.title,
            bodyText:req.body.bodyText,
            hashtags:req.body.hashtags,
            //here will be the path od media uploaded
            media:filepath,
        }
    });

    //saving the post object in model
    newPost.save()
        .then(result=>{
            console.log(result);
            User.findByIdAndUpdate({"_id":req.UserData.userId},{$inc:{posts:1}}).exec()
                .then(up=>{
                    res.json({
                        message: "Post Created",
                        post:result
                    })
                    .catch(er =>{
                        res.json({
                            error: er
                        });
                    });    
                });
        })
        .catch(err =>{
            res.json({
                error: err
            });
        }); 
});


//ratting the post by any user(non auth too)
//we will add user "whorated" (ONLY FOR CONTESTS) it if not then it go by "anonymus user" 
router.post('/rateit',(req,res,next)=>{
    Post.findByIdAndUpdate({"_id":req.body.p_id},{$set:{rating:req.body.rate}}).exec()
        .then(result=>{
                    res.json({
                        message:true,
                        newrate:req.body.rate
                    });
        })
        .catch(err=>{
            res.json({
                message:false,
                error:err
            });
        });
});

//deleting the all values
router.delete('/del/all',(req,res,next)=>{
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