import { apiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
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

const {fullName , email,username, password} = req.body
console.log("fullName :" ,fullName)

if(
    [fullName,email,username,password].some((field)=>
    field?.trim() === "")
){
throw new apiError(400, "all fields are required")
}

const existedUser =User.findOne({
    $or : [{email}, {password}]
})

if(existedUser){
    throw new apiError(409, "user with this email or password already exist")
}


})

export  {registerUser};