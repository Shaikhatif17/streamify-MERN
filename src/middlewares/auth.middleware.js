import {apiError} from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import  Jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJwt= asyncHandler(async(req,_,next)=>{
  
try {
        const token =   req.cookies?.accessToken || req.header("Authorization").replace("Bearer " , "")
         if(!token){
            throw new apiError(401 , "unauthorized request")
         }
          const decodedToken =  Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user =await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
    )
    if(!user){
        throw new apiError(401 , "invalid access token")
    }
    req.user =user
    next()
} catch (error) {
    throw new apiError(401 , error?.message || "invalid access token")
}

     
  

})