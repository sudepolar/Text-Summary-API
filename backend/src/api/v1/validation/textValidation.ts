import Joi from "joi";
import { RequestSchema } from "../middleware/validate";

/**
 * Item schema organised by request type
 */
export const itemSchemas: Record<string, RequestSchema> = {
    // POST /api/v1/text-summary - Create new Item
    create: {
        body: Joi.object({
            textContent: Joi.string().required().messages({
                "any.required": "Text is required",
                "string.empty": "Text cannot be empty",
            }),
        }),
    },

    // PUT /api/v1/text-summary/:id - Update Item
    update: {
        params: Joi.object({
            id: Joi.string().required().messages({
                "any.required": "Loan ID is required",
                "string.empty": "Loan ID cannot be empty",
            }),
        }),
        body: Joi.object({
            textContent: Joi.string().optional().messages({
                "any.required": "Loan status is required",
                "string.empty": "Name cannot be empty",
            }),
        }),
    },
};
