import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { AuthenticationError } from "../errors/errors";
import { getErrorMessage, getErrorCode } from "../utils/errorUtils";
import { auth } from "../../../../config/firebaseConfig";

/**
 * Middleware to authenticate a user using Firebase ID token.
 *
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next middleware function
 */
const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader: string | undefined = req.headers.authorization;
        // Does it look like this 'Bearer {token-id}'
        // Bearer token-id => splits into [0:"Bearer", 1:"token-id"]
        const token: string | undefined = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined;

        if (!token) {
            throw new AuthenticationError(
                "Unauthorized: No token provided",
                "TOKEN_NOT_FOUND"
            );
        }

        const decodedToken: DecodedIdToken = await auth.verifyIdToken(token);

        // storing the user's id and role in the resposne for use in other middleware or routes
        res.locals.uid = decodedToken.uid;
        res.locals.role = decodedToken.role;

        next();
    } catch (error: unknown) {
        if (error instanceof AuthenticationError) {
            next(error);
        } else if (error instanceof Error) {
            next(
                new AuthenticationError(
                    `Unauthorized: ${getErrorMessage(error)}`,
                    getErrorCode(error)
                )
            );
        } else {
            next(
                new AuthenticationError(
                    `Unauthorized: Invalid token`,
                    "TOKEN_INVALID"
                )
            );
        }
    }
};

export default authenticate;
