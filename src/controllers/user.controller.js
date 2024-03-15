import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    return { accessToken, refreshToken };
    user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation -- make sure email and password are not empty
  //check if user already exist :- email,password
  //check for images, avatar
  //upload images and avatar on cloudinary
  //create user object -create entry on db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }
  //    console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from req.body
  //login with username or email
  //find user
  //check paswsword
  //generate access token and refresh token

  //return response with cookies

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new apiError(400, "email or username required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged In successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new apiError(401 , "unauthorized request")
    }
  const decodedToken =   jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   const user = await User.findById(decodedToken._id)
   if(!user){
    throw new apiError(401 , "invalid refreshToken")

   }
   if(incomingRefreshToken !== user?.refreshToken){
    throw new apiError(401 , "refresh token is expired or used")

   }
   const options = {
    httpOnly:true,
    secure:true,
   }
  const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)
return refreshAccessToken.status(200)
.cookie("accessToken" , accessToken,options)
.cookie("refreshToken" ,newRefreshToken,options)
.json(
    new apiResponse(200 ,
        {
         accessToken , 
         refreshToken: newRefreshToken,
        },
        "access token refreshed")
)

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword , newpassword}= req.body
  const user = await User.findById(req.user?._id)
 const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect){
    throw new apiError(400 , "invalid old password")
 }
 req.password =newpassword
 user.save({validateBeforeSave :false})
})



const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json( new apiResponse(
        201,req.user ,"user fetched successfully"
    ))
})

const updateAccoutDetails = asyncHandler(async(req,res)=>{
    const {email , fullName} = req.body
      if(!(email || fullName)){
        throw new apiError(400 , "all fields are required")
         }

      const user=   await User.findByIdAndUpdate(req.user?._id , {
            $set :{
                fullName,
                email,
            }
         }).select("-password")

         return res
         .status(200)
         .json(
            new apiResponse(200 , user , "AccountDetails successFully")
         )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new apiError(400 , "avatar local path is missing")
    }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url){
    throw new apiError(400 , "ERROR while uploading avatar")
   }
 const user=  await User.findByIdAndUpdate(req.user?._id,{
    $set :{
        avatar:avatar.url
    }
 },{
    new:true
 }
 ).select("-password")
 return res.status(200)
 .json(
    new apiResponse(200 , user , " avatar updated successfully")
 )
})



const updateUserCoverImage = asyncHandler(async(req,res)=>{
   const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new apiError(400 ,"cover image local path is missing")
    }
const coverImage =await uploadOnCloudinary(coverImageLocalPath)
if(!coverImage.url){
    throw new apiError(400, "ERROR while uploading on coverImage")
}
 const user = await User.findByIdAndUpdate(
        req.user._id , {
            $set:{
             coverImage :coverImage.url
            }
        },
        {new: true}
    )
    return res.status(200)
    .json(
       new apiResponse(200 , user , "coverImage updated successfully")
       )
})



const getUserChannelProfile = asyncHandler(async(req,res)=>{
const {username}= req.params
if(!username?.trim()){
  throw new apiError(400 ,"user does not exist")
}

const channel =await User.aggregate([
  {
    $match:{
      username:username.toLowerCase()
    }
  },
  {
    $lookup:{
      from: "subscriptions",
      localField:"_id",
      foreignField: "subscriber",
      as: "subscribers"
    }
  },{
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"channel",
      as: "subscribedTo"
    }
  },
  {
    $addFields:{
      subscribersCount:{
        $size :"$subscribers"
      },
      subscribedToCount :{
        $size: "$subscribedTo"
      },
      isSubscribedTo:{
        $cond:{
          if:{$in:[req.user?._id , "$subscribers.subscriber"]},
          then: true,
          else: false
        }
      }
    }
  },
  {
    $project:{
      fullName:1,
      username:1,
      email:1,
      coverImage:1,
      avatar:1,
      subscribers:1,
      subscribedTo:1,

    }
  }
 
])

if(!channel?.length){
throw new apiError(401, "channel does not exist")

res.status(200)
.json(
  new apiResponse(200, channel[0], "user channel fetched successfully")
)
}
})

const getWatchHistory= asyncHandler(async(req,res)=>{
 const user = await User.aggregate([
     {
      $match: {
        _id :new mongoose.Types.ObjectId(req.user._id)
      }
     },
     {
      $lookup:{
        from :"videos",
        localField: "watchHistory",
        foreignField: "_id",
        as :"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField :"owner",
              foreignField:"_id",
              as :"owner",
              pipeline:[
                {
                 $project:{
                  fullName:1,
                  username:1,
                  avatar:1
                 }
                }
              ]
            }
          },
         {
          $addFields :{
            owner:{
              $first: "$owner"
            }
          }
         }
        ]
      }
     }
  ])
 
  return res
  .status(200)
  .json(
    new apiResponse(200 , 
      user[0].watchHistory,
      "users watch history fetched successfully"
      )
  )
  
})




 

export { registerUser, 
    loginUser,
     logOutUser,
      refreshAccessToken ,
      changeCurrentPassword,
      getCurrentUser,
    updateAccoutDetails,
updateUserAvatar,
updateUserCoverImage,
getUserChannelProfile};
