import mongoose , {isValidObjectId} from "mongoose"
import { PlayList } from "../models/playlist.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const createPlaylist =asyncHandler(async(req,res)=>{
    const {name,description} =req.params
    if(!(name || description)){
        throw new apiError(400, "name and description are required");
    }
   const playlist = await PlayList.create({
        name,
        description,
        owner:req.user?._id
    } )

    res
    .status(200)
    .json(new apiResponse(
        200,
        playlist,
        "playlist created successfully"
    ))
})



const getUsersplaylists =asyncHandler(async(req,res)=>{

    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new apiError(400, "invalid userId")
    }

    const playlists = await PlayList.aggregate([
        {
            $match :{
                owner : new mongoose.Types.ObjectId(userId)
            }

        },
        {
            $lookup:{
                from: "videos",
                localField:"videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields :{
                totalVideos :{
                    $size :"$videos"
                },
                totalViews:{
                    $size: "$videos.views"
                }
            }
        },
        {
            $project:{
                _id:1,
                name:1,
                description:1,
                totalVideos:1,
                totalViews:1,
                updatedAt:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            200 , 
            playlists,
            "users playlists fetched successfully"
        )
    )
}
)


const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new apiError(
            400 , 
            " invalid playlistId"
        ) }
        const playlist = await PlayList.findById(playlistId)
        if(!playlist){
            throw new apiError(404 , 
                "playlist doesnot exist")
        }


      const  playlistVideos = await PlayList.aggregate([
        {
            $match :{
                _id :new mongoose.Types.ObjectId(playlist)

            }
        },
        {
            $lookup :{
                from: "videos",
                localField :"videos",
                foreignField :"_id",
                as: "videos"
            }
        },
        {
            $match: {
                "videos.isPublished" :true
            }
        },
        {
            $lookup:{
                from : "users",
                localField:"owner",
                foreignField:"_id",
                as :"owner"
            }
        },
        {
            $addFields :{
                totalVideos:{
                    $size :"$videos"
                },
                totalViews :{
                    $sum :"$videos.views"
                },
                owner: {
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                createdAt :1,
                updatedAt :1,
                totalVideos:1,
                toalViews:1,
                videos:{
                    _id:1,
                    "videoFile.url":1,
                    "thumbnail.url":1,
                    title:1,
                    description:1 , 
                    duration:1,
                    createdAt:1 ,
                    viewa:1,
                },
                owner :{
                    username:1,
                    fullName:1,
                    "avatar.url" :1
                }
            }
        }
      ]);

      return res
      .status(200)
      .json(
        new apiResponse(200,
            playlistVideos[0],
            "playlist fetched successfully")
      )

})




const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId, videoId}= req.params
    if(!(isValidObjectId(playlistId)|| isValidObjectId(videoId))){
        throw new apiError(400 , "invalid videoId or PlaylistId")
    }
   const playlist = await PlayList.findById(playlistId)
 const video =   await PlayList.findById(videoId)
  if(!playlist){
    throw new apiError(400 , "playlist does not found")
  }
  if(!video){
    throw new apiError(400 , "video doesnot found")
  }

  const addToPlayList =await PlayList.findByIdAndUpdate(
    playlist?._id,{
        $addToSet :{
            video:videoId
        }
    },
    {
        new:true
    }
  )
  if(!addToPlayList){
    throw new apiError(400 ,"unable to add video to playlist")
  }

  return res
  .status(200)
  .json(
    new apiResponse(
        200,
        addToPlayList,
        "video added to playlist successfully"
    )
  )
})




const removeVideoFromPlaylist =  asyncHandler(async(req,res)=>{
    const {playlistId , videoId} = req.params
    

    if(!(isValidObjectId(playlistId)|| isValidObjectId(videoId))){
        throw new apiError(400, "invalid playlistId or videoId")
    }
   const playlist= await PlayList.findById(playlistId)
   const video = await PlayList.findById(videoId)


   if(
    (playlist.owner?.toString() && video.owner?.toString()) !==
    req.user?._id.toString()
   ){
    throw new apiError(
        404 , "only owner can remove video from playlist"
    )
   }

   const updatedPlaylist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
        $pull: {
            videos: videoId
        }
    },{
        new :true
    }
   )

   return res
   .status(200)
   .json(
    new apiResponse(
        200 ,
     updatedPlaylist,
     " video removed from playlist"
    )
   )
})



export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}