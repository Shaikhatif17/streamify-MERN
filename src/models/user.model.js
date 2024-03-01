import mongoose ,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema =Schema(
    {
 username :{
    type :String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true

 },
 email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
 },
 fullName :{
    type:String,
    required:true,
    trim:true,
    index:true
 },
 avatar:{
    type:String , //cloudinary url
    required:true
 },
 coverImage:{
    type:String  //cloudinary
 },
 watchHistory:[
    {
    type: Schema.Types.ObjectId,
    ref:"Video"
 }
],
password:{
    typw:String,
    required:true
},
refreshToken:{
    type:String
}
},
{timestamps:true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("paswword")) return next();

this.password =bcrypt.hash(this.password,10)
next()

})

userSchema.methods.isPasswordCorrect = async function(password){
    return bcrypt.compare(password,this.password)
}

export const User =mongoose.model("User",userSchema)