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

/**
 * Controller that retrieves creates a text summary
 * 
 * @param {Request} req - The express Request
 * @param {Response} res - The express Response
 * @param {NextFunction} next - The exress middleware chaining function
 * @throws error which will be passed to the global error handler
 * @returns {void} Sends a JSON response of all tickets stored
 */
export const createText = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { subject, textContent } = req.body;
        
        const newText: Text = await textServices.createText(
            { subject, textContent},
            req.file
        );

        res.status(HTTP_STATUS.CREATED).json(
            successResponse(newText, "Text summary created")
        );
    } catch (error: unknown) {
        next(error);
    }
}

/**
 * Controller that updates a text summary
 * 
 * @param {Request} req - The express Request
 * @param {Response} res - The express Response
 * @param {NextFunction} next - The exress middleware chaining function
 * @throws error which will be passed to the global error handler
 * @returns {void} Sends a JSON response of all tickets stored
 */
export const updateText = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = String(req.params.id);

        const { summary } = req.body;

        const updatedText: Text = await textServices.updateText(id, {
            summary
        });

        res.status(HTTP_STATUS.OK).json(
            successResponse(updatedText, "Text Summary updated")
        );
    } catch (error: unknown) {
        next(error);
    }
};

/**
 * Controller that deletes a textsummary
 * 
 * @param {Request} req - The express Request
 * @param {Response} res - The express Response
 * @param {NextFunction} next - The exress middleware chaining function
 * @throws error which will be passed to the global error handler
 * @returns {void} Sends a JSON response of all tickets stored
 */
export const deleteText = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: string = String(req.params.id);

        await textServices.deleteText(id);
        res.status(HTTP_STATUS.OK).json(
            successResponse("Loan summary successfully deleted")
        )
    } catch (error: unknown) {
        next(error);
    }
}

/**
 * Controller that gets a text summary by id
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next
 * @throws error which will be passed to the global error handler
 * @returns {void} Sends a JSON response of an item with the same id
 */
export const getTextById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {

        const id: string = String(req.params.id);

        const text: Text = await textServices.getTextById(id);

        res.status(HTTP_STATUS.OK).json(
            successResponse(text, "Text retrieved successfully")
        );

    } catch (error) {

        res.status(HTTP_STATUS.NOT_FOUND).json({
            message: "Text not found"
        });

    }

};