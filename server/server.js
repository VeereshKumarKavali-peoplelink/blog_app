const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3005;



const initializeDbAndServer = async () => {
    try {
        await mongoose.connect(mongoURI)
            .then(() => console.log("MongoDB Connected..."));

        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDbAndServer();



const User = require("./models/user");
const Post = require("./models/post");

function authenticateToken(request, response, next) {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
    }
    if (jwtToken === undefined) {
        response.status(401).send("Invalid JWT Token");
    } else {
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", (error, payload) => {
            if (error) {
                response.status(401).send("Invalid JWT Token");
            } else {
                request.email = payload.email;
                next();
            }
        });
    }
}

const validatePassword = (password) => {
    return password.length > 5;
};

// API to signup 
app.post("/signup", async (request, response) => {
    try {
        console.log("api hitted++++++");
        const { username, email, password, gender } = request.body;
        console.log(request.body);
        console.log(password);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)

        const existingUser = await User.findOne({ email });
        console.log(existingUser);
        if (!existingUser) {
            if (validatePassword(password)) {
                const newUser = new User({ username, email, password: hashedPassword, gender });
                await newUser.save();
                response.send({ msg: "User created successfully" });
            } else {
                response.status(400).send({ err_msg: "Password is too short" });
            }
        } else {
            response.status(400).send({ err_msg: "User already exists" });
        }
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }
});

// API to login
app.post("/login", async (request, response) => {
    try {
        const { email, password } = request.body;
        const user = await User.findOne({ email });
        if (!user) {
            response.status(400).send({ err_msg: "Invalid user" });
        } else {
            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (isPasswordMatched) {
                const payload = { email: user.email };
                const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
                response.send({ jwtToken, ok: true });
            } else {
                response.status(400).send({ err_msg: "Invalid password" });
            }
        }
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }
});


//API to get user
app.get("/user", authenticateToken, async (request, response) => {
    try {
        const { email } = request;
        const user = await User.findOne({ email }, { _id: true, email: true , username: true});
        response.status(200).send({ userId: user._id, userName: user.username });
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }
})


//API to Get all posts with pagination
app.get("/posts/", authenticateToken, async (request, response) => {
    try {
        // Default values for page and limit
        const page = parseInt(request.query.page) || 1;       
        const limit = parseInt(request.query.limit) || 10;   

        // Calculate the starting index of the posts to fetch
        const startIndex = (page - 1) * limit;

        // Fetch the posts with pagination and get the total count
        const posts = await Post.find().skip(startIndex).limit(limit);
        const totalPosts = await Post.countDocuments();
        response.status(200).send({
            posts,
            pageInfo: {
                totalPosts,
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                pageSize: limit,
            },
        });
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }
});


//API to create a  Blog 
app.post("/posts/", authenticateToken, async (request, response) => {
    try {
        console.log("api hitted++++++");
        const { title, topic, content, authorId, author } = request.body;
        console.log("++++");
        const image_url = 'https://res.cloudinary.com/dxgomsuxu/image/upload/v1730907027/placeholder-3-img_ktkybs.png';
        const avatar_url = 'https://res.cloudinary.com/dxgomsuxu/image/upload/v1730907083/avatar-img_we6vgj.png';
        console.log(title, topic, content, authorId, author);
        if (title && topic && content && authorId && author) {
            const newPost = new Post({ title, topic, content, author_id: authorId, createdAt: new Date().valueOf(), image_url, avatar_url, author });
            await newPost.save();
            response.send({ result: "Post created successfully" });
        } else {
            response.status(400).send({ err_msg: "Bad Request" });
        }
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }

})

//API to update a blog
app.put("/posts/:postId/", authenticateToken, async(request, response)=>{
    try{
        const { authorId, title, topic, content } = request.body;
        const { postId } = request.params;
        const post = await Post.findOne({ _id: postId });
        if (post && post.author_id === authorId){
            const finalItem = {
                title: title,
                topic: topic,
                content: content,
                updatedAt: new Date().valueOf(),
            }
             await Post.updateOne(
                {
                  _id: postId,
                },
                { $set: finalItem },
                { new: true }
              );
             response.status(200).send({result: "updated Successfully"});
        }else{
            response.status(400).send({ err_msg: "Bad Request, only author can update post" });
        }

    }catch(error){
        response.status(500).send({ err_msg: "Internal Server Error" });
    }

});


//API to delete a blog
app.delete("/posts/:postId", authenticateToken, async (request, response) => {
    try {
        const { postId } = request.params;
        const { userId } = request.query;
        console.log(postId);
        const post = await Post.findOne({ _id: postId });
        if (post && post.author_id === userId) {
            await Post.deleteOne({ _id: postId });
            response.status(200).send({ msg: "Deleted successfully" });
        } else {
            response.status(400).send({ err_msg: "Bad Request, only author can delete post" });
        }
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }

})


// API to GET a particular blog post
app.get("/posts/:postId/", authenticateToken, async (request, response) => {
    try {
        const { postId } = request.params;
        console.log(postId);
        const post = await Post.findOne({ _id: postId });
        if (post) {
            response.send(post);
        } else {
            response.status(404).send("Post not found");
        }
    } catch (error) {
        response.status(500).send({ err_msg: "Internal Server Error" });
    }
});

module.exports = app;
