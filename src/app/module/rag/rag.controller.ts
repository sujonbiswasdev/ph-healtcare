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
    const result = await ragService.queryAnswer(query, limit ?? 5, sourceType);
    sendResponse(res, {
        success: true,
        message: '',
        httpStatusCode: 200,
        data: result
    })
})


export const RagController = {
    queryRag,
    ingestDoctor
}