require('dotenv').config();
const cookieParser = require('cookie-parser')
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const mongoUri = process.env.MONGO_URI;
const origin = process.env.ORIGIN;
const mongoose = require('mongoose');
const corsOptions = {
    origin,     
    credentials:true,
    optionsSuccessStatus:200        
}

app.use(cookieParser());
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(cors(corsOptions));

mongoose.connect(mongoUri , {
    useNewUrlParser : true , useUnifiedTopology : true
}).then(console.log("connected to database")).catch((err)=>{ console.log("catch : ",err)});

const commentSchema = mongoose.Schema({
    cmtId : String ,
    userId : String,
    date : Date,
    comment : String ,
    likeCount : Number
});

const blogSchema = mongoose.Schema({
    date : Date,
    duration: Number,
    userId : String,
    blogId : String,
    coverImgURL : String ,
    title :String,
    body : String,
    category : String,
    likeCount : Number,
    shareCount: Number,
    saveCount: Number,
    comments: [commentSchema]
})

const userSchema = mongoose.Schema({
    userId : String,
    firstName:String ,
    lastName:String,
    emailId:String,
    password:String,
    profilePic:String,
    bio:String,
    followerCount:Number,
    followingCount:Number,
    postsCount:Number,
    posts:[String] ,
    likedPosts : [String] ,
    savedPosts : [String] ,
    likedComments : { type : Map , of : [String] }
})

const Users = mongoose.model("Users" , userSchema);
const Blogs = mongoose.model("Blogs" , blogSchema);

function generateUserId(){

    let first , second ;

    do{

        first = Math.random() ;
        
    }while(first < 0.1 ) ;

    do{

        second = Math.random() ;
        
    }while(second < 0.1 ) ;
    
    return "UID-"+ Math.floor(first*1000) + "-" + Math.floor(second*1000) ;
}

function generateBlogId(){

    let first , second ;
    
    do{

        first = Math.random() ;
        
    }while(first < 0.1 ) ;

    do{

        second = Math.random() ;
        
    }while(second < 0.1 ) ;
    
    return "BID-"+ Math.floor(first*1000) + "-" + Math.floor(second*1000) ;
}

function generateCommentId(){

    let first , second ;

    do{

        first = Math.random() ;
        
    }while(first < 0.1 ) ;

    do{

        second = Math.random() ;
        
    }while(second < 0.1 ) ;
    
    return "CID-"+ Math.floor(first*1000) + "-" + Math.floor(second*1000) ;
}

function AuthenticateToken(req,res,next){

    let token = req.cookies.authToken ;

    if(!token){
        res.sendStatus(401);
        return;
    }
    else{

        try{
            let payload = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

            req.payload = payload;

            next();

            return;

        }
        catch{
            res.sendStatus(498);

            return;
        }
    }

}

app.post("/signup" , async (req , res)=>{

    let {firstName , lastName , emailId , password } = req.body ;

    let user = await Users.findOne({emailId});
    console.log("1") ;
    let payload = { emailId };

    if(user){

        console.log("2") ;

        res.send("taken");

        return ;
    }

    firstName = firstName.slice(0,1).toUpperCase() + firstName.slice(1);
    lastName = lastName.slice(0,1).toUpperCase() + lastName.slice(1);

    console.log(firstName , " " , lastName) ;

    let userId = generateUserId() ;

    Users.create({
        userId,
        firstName,
        lastName,
        emailId,    
        password,
        bio:"hey there ! I am using Lettura.",
        profilePic: "https://res.cloudinary.com/dgqba5trl/image/upload/v1696008033/tiktok-no-profile-picture_n2pgwo.avif",
        followerCount: 0,
        followingCount: 0 ,
        postsCount:0,
        posts:[] ,
        likedPosts : [] ,
        savedPosts : [] ,
        likedComments : {}
    })

    user = await Users.findOne({emailId});

    console.log(user) ;

    let token = jwt.sign( payload ,process.env.ACCESS_TOKEN_SECRET  ); // payload

    res.cookie("authToken" , token ,{ httpOnly : true , sameSite : "none" , secure : true})

    res.json({code : 2 , user});    
})

app.post("/login" , async (req , res)=>{

    let { emailId , password } = req.body ;

    let user = await Users.findOne({emailId});
    let payload = { emailId };

    if(!user || (password != user.password)){
        res.json({ code : 1 , message : "email or password is incorrect"});
    }
    else{

        let token = jwt.sign( payload , process.env.ACCESS_TOKEN_SECRET);

        let {firstName , lastName , emailId ,profilePic, bio , postsCount , followerCount , followingCount} = user;

        user = {firstName , lastName , emailId ,profilePic, bio , postsCount , followerCount , followingCount};

        res.cookie("authToken" , token ,{ httpOnly : true , sameSite : "none" , secure : true})
        res.json({ code : 2 , user});

    }

})

app.get("/explore-header" ,AuthenticateToken, async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId}) ;

    res.json({
        profilePic : user.profilePic
    });
 
 })

app.get("/user-profile" , AuthenticateToken , async (req , res)=>{

    let user = await Users.findOne({emailId : req.payload.emailId}) ;

    let {firstName , lastName , emailId , profilePic , bio , followerCount , followingCount , postsCount} = user ;

    res.json({firstName , lastName , emailId , profilePic , bio , followerCount , followingCount , postsCount}) ;

})

app.get("/myposts" , AuthenticateToken ,async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId}) ;

    let blogIds = user.posts ;

    let posts = await Blogs.find({ blogId : { $in : blogIds}}) ;

    res.json({
        posts , user : {firstName :user.firstName , lastName : user.lastName , profilePic : user.profilePic} 
    })
})

app.get("/likedposts" , AuthenticateToken ,async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId}) ;

    let blogIds = user.likedPosts;

    let likedPosts = await Blogs.find({ blogId : { $in : blogIds}}) ;

    let posts = await Promise.all(likedPosts.map(async (post)=>{

        let userId = post.userId ;

        let user = await Users.findOne({userId}) ;

        let {profilePic , firstName , lastName} = user ;

        let {blogId ,coverImgURL,title , body} = post ;

        post = {profilePic , firstName , lastName ,  blogId ,coverImgURL,title , body } ;

        return post ;
    }))

    console.log(posts) ;

    res.json({posts})
})

app.get("/savedposts" , AuthenticateToken ,async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId}) ;

    let blogIds = user.savedPosts;

    let savedPosts = await Blogs.find({ blogId : { $in : blogIds}}) ;

    let posts = await Promise.all(savedPosts.map(async (post)=>{

        let userId = post.userId ;

        let user = await Users.findOne({userId}) ;

        let {profilePic , firstName , lastName} = user ;

        let {blogId ,coverImgURL,title , body} = post ;

        post = {profilePic , firstName , lastName ,  blogId ,coverImgURL,title , body } ;

        return post ;
    }))

    console.log(posts) ;

    res.json({posts})
})

app.get("/explore" ,AuthenticateToken, async (req , res)=>{

    let b = await Blogs.find({}) ;

    let blogs = await Promise.all(b.map(async (blog)=>{

        let user = await Users.findOne({userId : blog.userId}) ;

        let {blogId ,userId ,coverImgURL  ,title ,body ,category ,likeCount } = blog ;

        return {blogId ,userId ,coverImgURL  ,title ,body ,category ,likeCount , profilePic : user.profilePic ,firstName : user.firstName ,lastName : user.lastName}
    })) ;

    res.json({blogs});

})

app.get("/profiles" ,AuthenticateToken, async (req , res)=>{
    let u = await Users.find({}) ;

    let users = await Promise.all(u.map(async (user)=>{

        let {profilePic, firstName, lastName, bio, userId } = user ;

        return {profilePic, firstName, lastName, bio, userId}
    })) ;

    let emailId = req.payload.emailId ;
    let currentUser = await Users.findOne({emailId}) ;

    res.json({profilesArray : users , currentUserId : currentUser.userId});
})

app.get("/postarticle" ,AuthenticateToken, async (req , res)=>{

    res.send("done");
 
 })

 app.post("/postarticle" ,AuthenticateToken, async (req , res)=>{

        let emailId = req.payload.emailId ;

        let user = await Users.findOne({emailId}) ;

        let {coverImgURL , title , body , duration} = req.body ;

        let blogId = generateBlogId() ;
        let date = new Date() ;


        // date : Date,
        // duration: Number,

        // blogId : String,
        // userId : String,
        // coverImgURL : String ,
        // title :String,
        // body : String,
        // category : String,
        // likeCount : Number,
        // shareCount: Number,
        // comments: [commentSchema]

        Blogs.create({
            userId : user.userId , blogId ,coverImgURL , title , body , duration , date , likeCount : 0,
            shareCount: 0 , saveCount : 0 , comments : []
        });

        user.posts.push(blogId) ;

        user.save() ;

        res.json({code : 2 , message : "post successfully created"}) ;
    
 })

 app.get("/editprofile" , AuthenticateToken , async (req , res)=>{

    let emailId = req.payload.emailId ;

    let user = await Users.findOne({emailId}) ;

    let {profilePic , firstName , lastName , bio} = user ;

    res.json({profilePic ,
         firstName ,
         lastName ,
         bio})
 })

app.post("/editprofile" , AuthenticateToken , async (req , res)=>{

    let {firstName , lastName , bio  , ppURL} = req.body ;

    let {emailId} = req.payload ;

    try{
        let user = await Users.findOne({emailId}) ;

        if(ppURL){
            user.profilePic = ppURL ;
        }

        firstName = firstName.slice(0,1).toUpperCase() + firstName.slice(1) ;
        lastName = lastName.slice(0,1).toUpperCase() + lastName.slice(1) ;

        user.firstName = firstName ;
        user.lastName = lastName ;
        user.bio = bio ;

        console.log(user) ;

        await user.save() ;

        res.json({user , code : 2 , message : "profile updated successfully."});

    }
    catch(err){

        console.error("Error updating profile:" , err);

        res.status(500).send({code : 1 , message : "An error occured while updating the profile."}) ;

    }

})

app.post("/authorprofile" ,AuthenticateToken, async (req , res)=>{

    let userId = req.body.userId ; 

    let user = await Users.findOne({userId}) ; 
    let {profilePic , firstName , lastName , postsCount , followerCount , followingCount , bio} = user ;

    let blogIds = user.posts ; 

    let blogs = await Blogs.find({blogId : {$in : blogIds}}) ;

   res.json({
    user : {profilePic , firstName , lastName , postsCount , followerCount , followingCount , bio} , 
    blogs
   });

})

app.post("/article", AuthenticateToken , async (req , res)=>{

    // change to handle the cases of user opening his own post

    let emailId = req.payload.emailId ;
    let blogId = req.body.blogId ;

    let blog = await Blogs.findOne({blogId});
    let user_poster = await Users.findOne({ userId : blog.userId})
    let user_viewer = await Users.findOne({ emailId});

    let isLiked = user_viewer.likedPosts.includes(blogId) ;
    let isSaved = user_viewer.savedPosts.includes(blogId) ;

    let viewerIsPoster = false ;

    if(user_poster.userId == user_viewer.userId){
        viewerIsPoster = true ;
    }

    let {profilePic , firstName , lastName , userId} = user_poster ;
    let likedComments = [];

    if(user_viewer.likedComments && user_viewer.likedComments.get(blogId)){
        likedComments = user_viewer.likedComments.get(blogId) ;
    }

    let mappedComments = await Promise.all(blog.comments.map(async (cmt)=>{

        let user = await Users.findOne({userId : cmt.userId}) ;

        let {cmtId , date , comment ,userId , likeCount} = cmt ; 
        let {firstName , lastName , profilePic} = user ;

        cmt = {cmtId , date , comment ,userId ,firstName , lastName , profilePic , likeCount} ;

        console.log("cmt>>" , cmt) ;

        return cmt ;

    })) ;

    console.log("mappedc>> " , mappedComments) ;

    console.log("blog>> " ,blog) ;

    res.json({
        blog ,
        user : {profilePic , firstName , lastName , userId} ,
        viewerIsPoster ,
        isLiked ,
        isSaved ,
        likedComments ,
        mappedComments

    });
})

app.post("/handle-post-like" , AuthenticateToken  , async (req , res)=>{

    let user = await Users.findOne({emailId : req.payload.emailId}) ;

    let {blogId , newStatus} = req.body ;
    
    let blog = await Blogs.findOne({blogId}) ;

    console.log("newStatus>>" ,newStatus) ;

    if(newStatus){

        console.log(user.likedPosts) ;
        user.likedPosts.push(blogId) ;
        console.log(user.likedPosts) ;

        (blog.likeCount)++ ; 

        console.log(blog.likeCount) ;

        await user.save() ;
        await blog.save() ;

        res.send("post liked successfully") ;
    }
    else{

        let newLikedPosts = user.likedPosts.filter((id)=>{
                return (id != blogId) ;
        })

        user.likedPosts = newLikedPosts ;

        (blog.likeCount)-- ;

        await user.save() ;
        await blog.save() ;

        res.send("liked removed successfully") ;

    }

})

app.post("/handle-post-save" , AuthenticateToken  , async (req , res)=>{

    let user = await Users.findOne({emailId : req.payload.emailId}) ;

    let {blogId , newStatus} = req.body ;
    
    let blog = await Blogs.findOne({blogId}) ;

    console.log("newStatus>>" ,newStatus) ;

    if(newStatus){

        user.savedPosts.push(blogId) ;

        (blog.saveCount)++ ; 

        await user.save() ;
        await blog.save() ;

        res.send("post saved successfully") ;
    }
    else{

        let newSavedPosts = user.savedPosts.filter((id)=>{
                return (id != blogId) ;
        })

        user.savedPosts = newSavedPosts ;

        (blog.saveCount)-- ;

        await user.save() ;
        await blog.save() ;

        res.send("unsaved successfully") ;

    }

})

app.post("/handle-post-comment" ,AuthenticateToken , async (req , res)=>{

    // cmtId : String ,
    // userId : String,
    // date : Date,
    // comment : String ,
    // likeCount : Number
    
    let user = await Users.findOne({emailId : req.payload.emailId}) ;
    let cmtId = generateCommentId() ;
    let date = new Date() ;

    let cmt = {
        cmtId , userId : user.userId , date , comment : req.body.comment , likeCount : 0
    }

    let blog = await Blogs.findOne({blogId : req.body.blogId}) ;

    blog.comments.push(cmt) ;

    await blog.save() ;

    blog = await Blogs.findOne({blogId : req.body.blogId}) ;

    let mappedComments = await Promise.all(blog.comments.map(async (cmt)=>{

        let user = await Users.findOne({userId : cmt.userId}) ;

        let {cmtId , date , comment ,userId , likeCount} = cmt ; 
        let {firstName , lastName , profilePic} = user ;

        cmt = {cmtId , date , comment ,userId ,firstName , lastName , profilePic , likeCount} ;

        console.log("cmt>>" , cmt) ;

        return cmt ;

    })) ;

    res.json({message : "comment added successfully" , code : 2  , newComments : mappedComments}) ;

})

app.post("/handle-comment-like" , AuthenticateToken , async (req , res)=>{

    let {blogId , cmtId ,code} = req.body ;
    let {emailId} = req.payload ;

    let user = await Users.findOne({emailId}) ;
    let blog = await Blogs.findOne({blogId}) ;

    console.log(code) 

    // like
    let arr = [] ;

    if(user.likedComments && user.likedComments.get(blogId)){
        arr = user.likedComments.get(blogId) ;
    }

    if(code == 1){ //unlike

        let newArr = arr.filter((c)=>{

            console.log(cmtId , " " , c) ;
            return (cmtId != c) ;
        })

        console.log(newArr) ;

        user.likedComments.set(blogId ,newArr) ;

    }
    else{//like
        console.log("liked") ;
        arr.push(cmtId) ;
        user.likedComments.set(blogId ,arr) ;
    }

    let newCmts = blog.comments.map((cmt)=>{

        if(cmt.cmtId == cmtId){

            if(code == 1){ //unlike
                cmt.likeCount-- ;
            }
            else{//like
                cmt.likeCount++ ;
            }
        }

        return cmt ;

    })

    blog.comments = newCmts ;

    await user.save() ;
    await blog.save() ;

    if(code == 1){
        res.json({message : "comment unliked"})
    }
    else{
        res.json({message : "comment liked"})
    }


})

app.listen(PORT , ()=>{
    console.log(`listening on port ${PORT}`);
})