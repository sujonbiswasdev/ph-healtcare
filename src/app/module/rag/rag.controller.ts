import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RagService } from "./rag.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
const ragService = new RagService()
const ingestDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.ingestDoctorData();
    sendResponse(res, {
        success: result.success,
        message:result.message,
        httpStatusCode: 200,
        data: result.indexCount
    })
})

export const RagController = {
    ingestDoctor
}