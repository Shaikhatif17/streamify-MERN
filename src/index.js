import { config } from "dotenv";
import connectDB from "./db/index.js";
import dotenv from "dotenv";


dotenv.config({
    path:"./env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000),()=>{
        console.log(`server is runnig on Port :${process.env.PORT}`)
    }
})
.catch((error)=>{
    // app.on("error",(error)=>{
    //     console.log("Mongo DB connection Lost :" , error)
    // })

    console.log("Mongo DB connection Lost :", error)
})




