const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const checkAuth = require('../middleware/check-auth');

const Category = require('../models/category');

//to get all categories
router.get('/categories',(req,res,next)=>{
    Category.find({})
        .exec()
        .then(result=>{
            //console.log(result);
            return res.json({
                categories: result 
            });
        })
        .catch(err=>{
            //console.log(err);
            return res.json({
                error: err
            });
        });
});


//to get a perticular category from db "/category/:categoryname"
router.get('/category/:name',(req,res,next)=>{
    Category.findOne({name:req.params.name})
        .exec()
        .then(result=>{
            //console.log(result);
            return res.json({
                category: result 
            });
        })
        .catch(err=>{
            //console.log(err);
            return res.json({
                error: err
            });
        });
});

//to add a new category
router.post('/addCategory',(req,res,next)=>{
    const newCategory= new Category({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        division: req.body.division
    });
    newCategory.save()
        .then(result=>{
            console.log(result);
            res.json({
                message: "Category Created",
                category:result
            })
        })
        .catch(err =>{
            res.json({
                error: err
            });
        });    
    
});

//to update the value of any category or division
router.put('/updateCategory/:catdivname',(req,res,next)=>{
    // if(.has("name")){
    //     req.body.name == req.params.catdivname
    // }
    Category.findOneAndUpdate({name:req.params.catdivname},{
        name: req.body.name,                        // name here is required, if dont want to use same name again 
        $push:{ division: req.body.division }       // if dont want to update the division just use division:[]
    }).exec()
        .then(result=>{
            //console.log(result);
            res.json({
                message: "Category Updated",
                category:result
            })
        })
        .catch(err =>{
            res.json({
                error: err
            });
        });    
    
});

//to delete a perticular category from db
router.delete('/:catdivId',(req,res,next)=>{
    Category.remove({_id:req.params.catdivId})
        .exec()
        .then(result=>{
            res.json({
                message: "Category Deleted"
            });
        })
        .catch(err=>{
            res.json({
                error: err
            });
        });
})

module.exports = router;