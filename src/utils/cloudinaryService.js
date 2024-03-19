import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { apiError } from "./apiError";

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_COUD_NAME,
    api_key :process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=>{
 try {
    if(!localFilePath) return null;
   const response = await cloudinary.uploader.upload(localFilePath,
        {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath);
        return response
 } catch (error) {
    fs.unlinkSync(localFilePath)  // remove the locally saved temporary file as the upload operation got failed
    console.log("cloudinary service error",error)
    return null
 }
}

const deleteOnCoudinary = async(public_id , resource_type = "image")=>{
    try {
        if(!public_id) return null;
        await cloudinary.uploader.destroy(public_id,{
            resource_type: `${resource_type}`
        })
    } catch (error) {
        throw error;
        console.log("failed to delete on cloudinary", error)
    }
}


export {uploadOnCloudinary , deleteOnCoudinary}