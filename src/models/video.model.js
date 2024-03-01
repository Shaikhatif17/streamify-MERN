import mongoose,{Schema} from "mongoose"
import mongooseAggrigatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
  videoFile:{
    type:String, //cloudinray url
    required:true
  },
  thumbnail:{
    type:String, //cloudinary url
    required:true
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
   

  },
  title:{
    type:String,
   required:true
  },
  description:{
    type:String,
    required:true
  },
  views:{
    type: Number,
    default:0
  },
  duration:{
    type:Number,
    required:true
  },
  isPublished:{
    type:Boolean,

  }

},
{timestamps:true})


videoSchema.plugin(mongooseAggrigatePaginate)

export const Video = mongoose.model("Video",videoSchema)