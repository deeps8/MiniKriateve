const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const userRoutes = require('./api/routes/users');
const postRoutes = require('./api/routes/posts');
const commRoutes = require('./api/routes/commreply');
const catdivRoutes = require('./api/routes/catdiv');
const contestRoutes = require('./api/routes/contest');

const port = process.env.PORT || 8080;

//connect to mongodb
mongoose.connect('mongodb+srv://deepak:sydniv@123@kriateve-hafwc.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser:true});


//on connection
mongoose.connection.on('connected',()=>{
    console.log('MongoDb connected at port 27017');
});

//on error
mongoose.connection.off('error',(err)=>{
    console.log('Error connecting MongoDb at port  : ' + err);
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin",'*');  
    res.header('Access-Control-Allow-headers','Origin, X-Requested-Width, Content-type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, GET, DELETE, POST');
        return res.status(200).json({});
    }
    next();
});

app.use('/user',userRoutes);
app.use('/posts',postRoutes);
app.use('/comreply',commRoutes);
app.use('/catdiv',catdivRoutes);
app.use('/contests',contestRoutes);
app.use('/uploads',express.static('uploads'));

app.use(express.static(path.join(__dirname,'public')));

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'public/index.html'));
});

// app.use((req,res,next)=>{
//     return res.json({
//         message:"Not found in routes"
//     })
// });

app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.json({
        error:{
            message: err.message
        }
    });
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


module.exports = app;