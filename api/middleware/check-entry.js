const mongoose = require('mongoose');
const express = require('express');
const Contest = require('../models/contests');
const User = require('../models/user');

module.exports = (req,res,next)=>{
    try{
        var flag=1;
        console.log(req.body);
        Contest.findOne({con_id:req.body.conid},"submissions -_id").exec()
        .then(result=>{
            
            result.submissions.forEach(el => {
                if(el.participant.name == req.UserData.username){
                    flag=0;
                    console.log("IN for in if "+flag);
                    next();
                }
            });
            console.log("outside for "+flag);

            if(flag==1){
                return res.json({
                    message:"Already Submitted",
                    error: err
                });
            }
            
        })
        .catch(err =>{
            console.log("in checkentry Contest not found");

            return res.json({
                message:"Contest not found",
                error: err
            });
        }); 
    }catch(error){
        console.log("in checkentry catch");

        return res.json({
            message: 'Submisstion Failed'
        });
    }
}