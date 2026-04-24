import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/errors";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import { errorResponse } from "../models/responseModel";

/**
 * Global error handling express middleware
 * Catches all errors passed to next() and formats them into a consistent response
 *
 * This middleware:
 * - Handles all AppErrors (AuthenticationError, etc.)
 * - Consistent error response formatting
 * - Logs errors to console for debugging
 * - Manages unexpected errors
 *
 * @param err - The error object passed down the middleware chain
 * @param _req - Express request object (unused but required for Express middleware signature)
 * @param res - Express response object
 * @param _next - Express next function (unused but required for Express middleware signature)
 */
const errorHandler = (
    err: Error | null,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (!err) {
        console.error("Error: null or undefined error received");
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
        );

        return;
    }

    // Log the error message and stack trace for debugging
    console.error(`Error: ${err.message}`);
    console.error(`Error: ${err.stack}`);

    // single check to handle all our custom application errors
    if (err instanceof AppError) {
        // Handle out custom application errors
        res.status(err.statusCode).json(errorResponse(err.message, err.code));
    } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
            // Handle unexpected errors e.g. third party library
            errorResponse("An unexpected error occurred", "UNKNOWN_ERROR")
        );
    }
};

export default errorHandler;
