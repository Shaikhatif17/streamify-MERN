import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"



const connectDB =async()=>{
    try{
      const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL} ${DB_NAME}`)
      console.log(``)
    }
    catch(error){
        console.log("Mongo DB connection FAILED ", error)
        process.exit(1)
    }
}