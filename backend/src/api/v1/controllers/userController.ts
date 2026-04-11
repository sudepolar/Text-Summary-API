// External imports
import { Request, Response, NextFunction } from "express";
import { UserRecord } from "firebase-admin/auth";

// Internal imports
import { auth } from "../../../../config/firebaseConfig";
import { successResponse } from "../models/responseModel";
import { HTTP_STATUS } from "../../../constants/httpConstants";

export const getUserDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: string  = String(req.params.id);

        const userRecord: UserRecord = await auth.getUser(id);
        res.status(HTTP_STATUS.OK).json(successResponse(userRecord));
    } catch (error: unknown) {
        next(error);
    }
};
