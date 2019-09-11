const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkEntry = require('../middleware/check-entry');
const multer = require('multer');
const mongoose = require('mongoose');

const Contest = require('../models/contests');
const User = require('../models/user');

//storage and filename of media uploaded 
const storage = multer.diskStorage({
    destination: function(req, file,cb){
        cb(null, './uploads/contest/conPoster');
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

//routes to be covered
//1. get all contests specific data only
//2. get data of a single contest
//3. adding a new contest
//4. updating a specific contest 
//       a: updating normal details(date,time,title,rules)
//       b: declaring the result of the contest (updating other models also[notification,Email])

//all contests
router.get('/all',(req,res,next)=>{
    Contest.find({},"-_id  division contestBody time con_id contestStart contestEnd  evaluationtime votes  subs")
        .sort({'time':-1})
        .exec()
        .then(result=>{
            return res.json({
                contests: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});

//all contests checkauth
router.get('/all/auth',checkAuth,(req,res,next)=>{
    Contest.find({ "submissions.participant.name": {$nin:req.UserData.username} },"-_id  division contestBody time con_id contestStart evaluationtime contestEnd votes  subs")
        .sort({'time':-1})
        .exec()
        .then(result=>{
            return res.json({
                contests: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});
//getting a perticular contest
router.get('/id/:contestid',checkAuth,(req,res,next)=>{
    Contest.find({"con_id":req.params.contestid},"-_id user division contestBody con_id time contestStart contestEnd evaluationtime  votes comments subs submissions")
        .exec()
        .then(result=>{
            return res.json({
                contests: result 
            });
        })
        .catch(err=>{
            console.log(err);
            return res.json({
                error: err
            });
        });
});

//adding contest
router.post('/add',checkAuth,(req,res,next)=>{

    //var divs = req.body.division.split(',');


    const newcontest = new Contest({
        _id: new mongoose.Types.ObjectId(),
        con_id: mongoose.Types.ObjectId(),
        category:req.body.ct,
        division: req.body.div,
        user:{
                profimg:req.UserData.profimg,
                name:req.UserData.username,
                userId:req.UserData.userId
            }, 
        contestBody:{               
                title:req.body.cbodyTitle,
                bodyText:req.body.cbodyText,
                rules:req.body.r
            },
        contestStart: req.body.cstart,
        contestEnd: req.body.cend,
        evaluationtime:req.body.eval
        });

        newcontest.save()
        .then(result=>{
                res.json({
                        message: "Contest Created",
                        contest: result
                    });
        })
        .catch(err =>{
            res.json({
                error: err
            });
        }); 
        
});

//submitting entery
router.post('/entry/add',checkAuth,(req,res,next)=>{
    var flag=1;
    console.log(req.body);
    Contest.findOne({con_id:req.body.conid},"submissions -_id").exec()
        .then(result=>{
            
            result.submissions.forEach(el => {
                if(el.participant.name == req.UserData.username){
                    flag=0;
                    console.log("IN for in if "+flag);
                }
            });
            console.log("outside for "+flag);

            if(flag==1){
                next();
            }
            return res.json({
                message:"already done",
                error: err
            });
        })
        .catch(err =>{
            console.log("in checkentry Contest not found");

            return res.json({
                message:"Contest not found",
                error: err
            });
        });

    }, upload.array('entrymedia[]',3),  (req,res,next)=>{ 
    var filepath=[];
      if(req.files.length === 0)
         {   
             console.log()
            }
        else{
            req.files.forEach(element => {
                filepath.push(element.path);
            });
        }

    var sub = new Object({
        _id: new mongoose.Types.ObjectId(),
        sub_id: mongoose.Types.ObjectId(),
        participant:{
                profimg:req.UserData.profimg,
                name:req.UserData.username,
                userId:req.UserData.userId
            },
            title:req.body.title,
            media:filepath,
            whorated:[]
        });
        
        //Submitting
        Contest.findOneAndUpdate({con_id:req.body.conid},{$push:{"submissions":sub}}).exec()
                .then(result=>{
                    return res.json({
                        message: "Submission Done",
                        enteryuser: flag
                   });
                })
                .catch(err =>{
                    return res.json({
                        message:"Your entry was not submitted ",
                        error: flag
                    });
                });
            
         
        
});

//delete submissions
//deleting the all values
// router.delete('/subdelete/:s_id',(req,res,next)=>{
//     Contest.remove({"submissions._id":req.params.s_id}).exec().then(result=>{
//         res.json({
//             message:"Deleted",
//             submission:result
//         });
//     })
//     .catch(err=>{
//         res.json({
//             message:"Not Deleted",
//             error:err
//         });
//     });
// });

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
    Contest.findOneAndUpdate({ con_id:req.body.p_id }, {$push:{ comments: newcomment } }).exec()
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
    Contest.findOneAndUpdate({ "comments.c_id":req.body.c_id }, { $push:{ "comments.$.replies": newreply }} ).exec()
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

//rating the submissions
router.post('/subs/rate',checkAuth,(req,res,next)=>{

    const whorate = new Object({
        value:req.body.ratevalue,
        profimg:req.UserData.profimg,
        name:req.UserData.username,
        userId:req.UserData.userId
    });

    Contest.findOne({"con_id":req.body.conid},{"submissions":{$elemMatch:{"sub_id": req.body.subid,"whorated":{$elemMatch:{"name":req.UserData.username}}}}}).exec()
        .then(result=>{
            if(result.submissions.length==0){
                req.body.rate.ratecount++;
                req.body.rate.total = Math.round((req.body.rate.total+req.body.ratevalue)/req.body.rate.ratecount);
                Contest.findOneAndUpdate({"con_id":req.body.conid,"submissions":{$elemMatch:{"sub_id": req.body.subid}}},{
                                                            $set:{"submissions.$.rating":req.body.rate},
                                                            $push:{"submissions.$.whorated":whorate}
                                                            }).exec()
                .then(rated=>{
                    res.json({
                        message:true,
                        rating: req.body.rate
                    });
                })
                .catch(err=>{
                    res.json({
                        message:false,
                        error:err
                    });
                });  
            }
            else{
                var prev;
                result.submissions[0].whorated.forEach(el => {
                    if(el.userId==req.UserData.userId){
                        prev = el.value;
                        return;
                    }
                });

                req.body.rate.total = Math.round((req.body.rate.total - prev + req.body.ratevalue)/req.body.rate.ratecount);

                Promise.all([
                    Contest.findOneAndUpdate({"con_id":req.body.conid,"submissions":{$elemMatch:{"sub_id": req.body.subid,"whorated":{$elemMatch:{"name":req.UserData.username}}}}},{
                        $set:{"submissions.$.rating":req.body.rate},
                        $pull:{"submissions.$.whorated":{"name":req.UserData.username}}
                        }),
                    Contest.findOneAndUpdate({"con_id":req.body.conid,"submissions":{$elemMatch:{"sub_id": req.body.subid}}},{
                        $push:{"submissions.$.whorated":whorate}    
                    })
                ])
                .then(rated=>{
                    res.json({
                        message:true,
                        rating: req.body.rate,
                        //flag:flag
                    });
                })
                .catch(err=>{
                    res.json({
                        message:false,
                        error:err
                    });
                });  
            }
              
                
        })
        .catch(err=>{
            res.json({
                message:false,
                error:err
            });
        });

});


module.exports = router;