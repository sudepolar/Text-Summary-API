import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { MiddlewareFunction } from "../types/express";
import { HTTP_STATUS } from "../../../constants/httpConstants";

export interface RequestSchema {
    body?: ObjectSchema;
    params?: ObjectSchema;
    query?: ObjectSchema;
}

interface ValidationOptions {
    stripBody?: boolean;
    stripQuery?: boolean;
    stripParams?: boolean;
}

/**
 * Create en Express middleware function that validates different parts of the request against separate Joi schemas and strips unknown fields appropriately
 * @param schemas - Object containing separate schemas for body, params, and query
 * @param options - Validation options for stripping request payloads
 * @returns Expres middleware function that performs the validation
 */
export const validateRequest = (
    schemas: RequestSchema,
    options: ValidationOptions = {}
): MiddlewareFunction => {
    const STRIP_BODY: boolean = true;
    const STRIP_PARAMS: boolean = true;
    const STRIP_QUERY: boolean = false;

    // returns a Middleware Function
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors: string[] = [];

            /**
             * Validate a specific part of the request against a Joi schema
             * @param validationSchema - Joi schema to validate against
             * @param requestData - The request data to validate
             * @param requestSectionName - Name of the request part for error prefixing
             * @param shouldStripFields - Whether to strip unknown fields from the validated data
             * @returns The original data if validation fails or stripping id disabled, otherwise the stripped/validated data
             */
            const validateRequestSection = <T>(
                validationSchema: ObjectSchema,
                requestData: T,
                requestSectionName: string,
                shouldStripFields: boolean
            ): T => {
                // abortEarly false means continue validation even if something fails validation
                const { error, value: strippedFields } =
                    validationSchema.validate(requestData, {
                        abortEarly: false,
                        stripUnknown: shouldStripFields,
                    });

                if (error) {
                    errors.push(
                        ...error.details.map(
                            (detail) =>
                                `${requestSectionName}: ${detail.message}`
                        )
                    );
                } else if (shouldStripFields) {
                    return strippedFields as T;
                }

                return requestData;
            };

            // validate each request part if a schema is provided
            if (schemas.body) {
                req.body = validateRequestSection(
                    schemas.body,
                    req.body,
                    "Body",
                    options.stripBody ?? STRIP_BODY
                );
            }

            if (schemas.params) {
                req.params = validateRequestSection(
                    schemas.params,
                    req.params,
                    "Params",
                    options.stripParams ?? STRIP_PARAMS
                );
            }

            if (schemas.query) {
                req.query = validateRequestSection(
                    schemas.query,
                    req.query,
                    "Query",
                    options.stripQuery ?? STRIP_QUERY
                );
            }

            // If there are any validation erros, return them
            if (errors.length > 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: `Validation error: ${errors.join(", ")}`,
                });
            }

            next();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            console.error(errorMessage);
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                message: "Error occurred during validation",
            });
        }
    };
};
