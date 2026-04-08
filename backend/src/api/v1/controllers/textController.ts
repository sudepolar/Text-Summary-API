import  { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import * as textServices from "../services/textServices";
import type { Text } from "../models/textModel";
import { successResponse } from "../models/responseModel";

/**
 * Controller that retrieves all text summaries stored
 * 
 * @param {Request} req - The express Request
 * @param {Response} res - The express Response
 * @param {NextFunction} next - The exress middleware chaining function
 * @throws error which will be passed to the global error handler
 * @returns {void} Sends a JSON response of all tickets stored
 */
export const getAllTexts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const texts : Text[] = await textServices.getAllTexts();
        res.status(HTTP_STATUS.OK).json({
            message: "Text applications retrieved",
            count: texts.length,
            data: texts,
        });
    } catch (error) {
        next(error);
    }
};