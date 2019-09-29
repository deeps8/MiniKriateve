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

//retrieving comments 
router.get('/comments/:pid',(req,res,next)=>{
    Post.find({"_id":req.params.pid})
        .sort({'time':-1})
        .exec()
        .then(result=>{
            return res.json({

                comments: result 
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
//data to be give : {pid,rtotal,rate}
router.post('/rateit',checkAuth,(req,res,next)=>{

    var Ruser={
        name:req.UserData.username,
        score:req.body.rate
    };
    var totalscore;
    var flag=0;
    //find the post to rate and check for if user already rated it.
    //use traditional way 
    Post.findById(req.body.p_id,function(err,doc){
                for(var i in doc.rating.users){
                    if(doc.rating.users[i].name === req.UserData.username){
                        doc.rating.total=doc.rating.total  - doc.rating.users[i].score ;
                        doc.rating.total=doc.rating.total + parseInt(req.body.rate);
                        doc.rating.users[i].score=req.body.rate;
                        flag=1;
                    }
                    
                }
                if(flag==0){
                    doc.rating.users.push(Ruser);
                    doc.rating.total=req.body.rtotal;
                    doc.rating.ratecount++;
                }
                totalscore=doc.rating.total;
                doc.save();
    }).exec()
    .then(result=>{
        res.json({
            message:true,
            output:{total:totalscore,Ruser}
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