const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');
const User = require('../models/user');


//diskStorage
const storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null, './uploads/userProfile');
    },
    filename: function(req, file, callback) {
        let fileName = '', username;
        console.log(req);
        var userProfileExt = file.originalname.split('.');
        fileName += new Date().getTime();
        fileName += "."+userProfileExt[userProfileExt.length-1];
        callback(null, fileName);
    }
});


const upload = multer({storage: storage});



router.post('/login',(req,res,next)=>{
    User.findOne({username: req.body.username})
        .exec()
        .then(user=>{
            console.log(user);
            if(user == null){
                return res.json({
                    message:'Auth Failed'
                });
            }
            if(user.length<1 ){
                return res.json({
                    message:'Auth Failed'
                });
            }
            // if(user[0].username === req.body.username){
            bcrypt.compare(req.body.password,user.password,(err,result)=>{
                if(err){
                    return res.json({
                        message: 'Auth Failed'
                    });
                }
                if(result){
                    const token = jwt.sign({
                        email: user.email,
                        username: user.username,
                        profimg: user.profimg,
                        userId: user._id
                    },
                    'mysecretjwtstringforkriatevedemo'
                    ,{
                        expiresIn: '1h'
                    });
                    return res.json({
                        message: 'Auth Successful',
                        token: token,
                        logStatus: true,
                        user: {
                                username: user.username,
                                email: user.email,
                                profimg: user.profimg,
                                description:user.description,
                                notify: user.notify,
                                followers: user.followers,
                                following: user.following
                        }
                    });
                }
                res.json({
                    message: 'Auth Failed'
                    });
                });
            // }else{
            //     return res.status(401).json({
            //         message:'Auth Failed'
            //     });
            // }
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});

router.post('/signup',upload.single('userProfile'),(req,res,next)=>{
    console.log(req.file);
    User.find({email: req.body.email})
        .exec()
        .then(user=>{
            console.log(user);
            if(user.length>=1){
                return res.json({
                    message: 'Mail Exists'
                });
            }else{
                User.find({username: req.body.username}).exec().then(user=>{
                    if(req.body.username==="you"){
                        return res.json({
                            message: 'Username exists'
                        });
                    }
                    if(user.length>=1){
                        return res.json({
                            message: 'Username exists'
                        });
                    }
                    else{
                        bcrypt.hash(req.body.password,10,(err,hash)=>{
                            if(err){
                                return res.json({
                                    error: err
                                });
                            }
                            else{

                                if(req.file == undefined)
                                    filepath = 'uploads/userProfile/defaultuser.png';
                                else
                                    filepath =  req.file.path;

                                const user = new User({
                                    _id: new mongoose.Types.ObjectId(),
                                    email: req.body.email,
                                    username: req.body.username,
                                    password: hash,
                                    profimg:filepath,
                                    prizes:[],
                                    });
                                user.save()
                                    .then(result=>{
                                        console.log(result);
                                        res.json({
                                            message: 'user created'
                                        });
                                    })
                                    .catch(err =>{
                                        res.json({
                                            error: err
                                        });
                                    });    
                            }
                        });
                    }
                });
            }
        });
    
});

router.get('/getauser',checkAuth,(req,res,next)=>{
    User.findOne( {_id: req.UserData.userId}).exec()
        .then(result=>{
            const user = new User({
                _id: result._id,
                email: result.email,
                username: result.username,
                profimg: result.profimg
                });   
        
        res.json({
            message:"User Found",
            user: result
            });
        })
        .catch(err=>{
            res.json({
                message:"User Not Found",
                error: err
            });
        });
});


//get any userdata
router.get('/getauser/:uname',(req,res,next)=>{
    User.findOne( {username: req.params.uname}).exec()
        .then(result=>{
            const user = new User({
                _id: result._id,
                email: result.email,
                username: result.username,
                profimg: result.profimg,
                description: result.description,
                notify: result.notify,
                prizes:result.prizes,
                followers: result.followers,
                following: result.following,
                posts: result.posts,
                contests: result.contests
                });   
        
        res.json({
            message:"User Found",
            user: result
            });
        })
        .catch(err=>{
            res.json({
                message:"User Not Found",
                error: err
            });
        });
});

router.delete('/:userId',(req,res,next)=>{
    User.remove({_id:req.params.userId})
        .exec()
        .then(result=>{
            res.json({
                message: "User Deleted"
            });
        })
        .catch(err=>{
            res.json({
                error: err
            });
        });
})

module.exports = router;