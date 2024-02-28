//asyncHandler is higher order function which returns a function as an arguement:--
//this asyncHnadler is created by the use of promises

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next).catch((err) => next(err)));
  };
};

//this is asyncHandlre is write by the use of try catch
//asyncHandler is higher order function which returns a function as an arguement:--

// const asyncHandler =(requestHandler)=>async(req,res,next)=>{
//  try{
//     await requestHandler(req,res,next)
//  }
//  catch(err){
//   res.status(err.code).json({
//     seccess:false,
//     meassage:err.message
//   })
//  }
// }
