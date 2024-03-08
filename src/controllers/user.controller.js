import { apiError } from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinaryService.js"
import { apiResponse } from "../utils/apiResponse.js"


const generateAccessAndRefreshToken = async(userId)=>{
try{
    const user = User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
     user.refreshToken =refreshToken
    return{accessToken ,refreshToken}
    user.save({validateBeforeSave :true})
}
catch(error){
    throw new apiError(500 , "something went wrong while generating access and refresh token")
}

}



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

   const {fullName, email, username, password } = req.body
   //console.log("email: ", email);

   if (
       [fullName, email, username, password].some((field) => field?.trim() === "")
   ) {
       throw new apiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
       $or: [{ username }, { email }]
   })

   if (existedUser) {
       throw new apiError(409, "User with email or username already exists")
   }
//    console.log(req.files);

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath = req.files.coverImage[0].path
   }
   

   if (!avatarLocalPath) {
       throw new apiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
       throw new apiError(400, "Avatar file is required")
   }
  

   const user = await User.create({
       fullName,
       avatar: avatar.url,
       coverImage: coverImage?.url || "",
       email, 
       password,
       username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
       "-password -refreshToken"
   )

   if (!createdUser) {
       throw new apiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
       new apiResponse(200, createdUser, "User registered Successfully")
   )

})

const loginUser = asyncHandler(
    async(req,res)=>{
        //get data from req.body
      //login with username or email
      //find user
      //check paswsword 
      //generate access token and refresh token
      
      //return response with cookies

      const {email,username ,password} =req.body
      if( !username || !email){
        throw new apiError(400 , "email or username required")
      }

    const user = await User.findOne({
        $or: [ {email}, {username}]
      })

     const isPasswordValid = user.isPasswordCorrect(password)
     
    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        " -password -refreshToken"
     )
    const options = {
        httpOnly :true,
        secure: true,
    }
      res.status(200)
      .cookie("accessToken", )
      
       
    }
)


export  {
    registerUser,
    loginUser
};