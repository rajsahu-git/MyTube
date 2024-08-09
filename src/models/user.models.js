import mongoose from "mongoose";
import bcrypt from "bcrypt"



const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        index:true,
        trim:true
    },
    userFullName:{
        type:String,
        required:true,
        trim:true
    },
    userEmail:{
        type:String,
        required:true,
        unique:true,
    },
    userAvatar:{
        type:String,
        required:true,
    },
    userCoverImage:{
        type:String
    },
    userWatchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video",
        },
    ],
    refreshToken:{
        type:String
    },
    password:{
        type:String,
        required:true,
    }

},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
     this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.method.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sing(
        {
            _id:this._id,
            email:this.email,
            userName:userName,
            userFullName:this.userFullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sing(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)