import { apiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinaryService.js"
import { apiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
   //get user details from frontend
   //validation -- make sure email and password are not empty
   //check if user already exist :- email,password
   //check for images, avatar
   //upload images and avatar on cloudinary
   //create user object -create entry on db
   //remove password and refresh token field from response
   //check for user creation
   //return res

const {fullName ,email,username ,password} = req.body

if(
    [fullName,email,username,password].some((feild)=>feild?.trim === "")
){
throw new apiError(400, "all fields are required")
}

const existedUser =User.findOne({
    $or :[{email}, {username}]
})
if(existedUser){
    throw new apiError(400 , "user with this email or username  already exist")
}
 const avatarLocalPath =req.files?.avatar[0]?.path;
 const coverImageLocalPath =req.files?.coverImage[0]?.path;

 if(!avatarLocalPath)
throw new apiError(400 ,' avatar is required')

const avatar = uploadOnCloudinary(avatarLocalPath)
const coverImage = uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new apiError(400 , "avatar file is required")
}
const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage :coverImage?.url || "",
    email,
    password,
    username :username.toLowerCase()  
})
const createdUser = await User.findById(user._id).select(
    " -password -refreshToken"
)
if(!createdUser){
    throw new apiError(500, "something went wrong while registering the user")
}
res.status(201).json(
  new  apiResponse(200 , "user registered successfully")
)

})



export  {registerUser};