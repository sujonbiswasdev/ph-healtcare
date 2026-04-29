import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RagService } from "./rag.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { redisService } from "../../lib/redis";
const ragService = new RagService()
const ingestDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.ingestDoctorData();
    sendResponse(res, {
        success: result.success,
        message: result.message,
        httpStatusCode: 200,
        data: result.indexCount
    })
})

const queryRag = catchAsync(async (req: Request, res: Response) => {
    const { query, limit, sourceType } = req.body;

    if (!query) {
        return sendResponse(res, {
            success: false,
            httpStatusCode: status.BAD_REQUEST,
            message: "Query is required",
        });
    }
    // generate cache key from query params
  const cacheKey=`rag:query:${query}:${limit??5}:${sourceType||"all"}`

  try {
    const cacheResult = await redisService.get(cacheKey)
    if(cacheResult){
      // cache-hit
      const parseData=JSON.parse(cacheResult);
      sendResponse(res,{
        success:true,
        httpStatusCode:status.OK,
        message:"Answer retrieved from cache",
        data:parseData
      })
    }
  } catch (error) {
    console.warn("Cache read error , proceeding with normal processing ",error)
  }



    const result = await ragService.queryAnswer(query, limit ?? 5, sourceType,true);
    sendResponse(res, {
        success: true,
        message: '',
        httpStatusCode: 200,
        data: result
    })
     try {
    // store cache with 10 min(600 secound)
    await redisService.set(cacheKey,result,600);
  } catch (error) {
    console.log("cache Write error",error)
  }
})

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.getStats();

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "RAG stats retrieved successfully",
    data: result,
  });
});


export const RagController = {
    queryRag,
    ingestDoctor,
    getStats
}