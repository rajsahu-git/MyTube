import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


 const registerUser = asyncHandler(async (req, res)=>{
    // res.status(200).json({
    //     message:"Raj Kumar Sahu"
    // })
    const {email,fullName,passWord,userName} = req.body
    console.log(fullName)
    if(
        [fullName,email,passWord,userName].some((field)=>
        field?.trim()=="")
        ){
            throw new ApiError(400,"All field are reqired")
        }
       const userExisted = User.findOne({
        $or:[{ userName },{ email }]
       })
       if(userExisted){
        throw new ApiError(409,"User with email or  username already exists")
        } 
        const avatarLocalPath=req.files?.avatar[0]?.path;
        const coverImageLocalPath=req.files?.coverImage[0]?.path;
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
        }
        const avatar =await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar){
            throw new ApiError(500,"Avatar file is required")   
        }
        const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            passWord,
            userName: userName.toLowerCase()
        })
        const createUser = await User.findById(user._id).select(
            "-password -refreshToken"
            )
        if(!createUser){
            throw new ApiError(500,"Somethin went wron when creating user")
        }
        return res.status(201).json(
            new ApiResponse(200, createUser,"User registered Successfully")
        )


})


export {registerUser}