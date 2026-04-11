import Joi from "joi";
import { RequestSchema } from "../middleware/validate";


/**
 * @openapi
 * components:
 *   schemas:
 *     CreateTextSummaryRequest:
 *       type: object
 *       required:
 *         - textContent
 *       properties:
 *         textContent:
 *           type: string
 *           description: The text content to be summarized
 *           example: "This is how to make a furry suit lol"
 *
 *     UpdateTextSummaryRequest:
 *       type: object
 *       properties:
 *         summary:
 *           type: string
 *           description: The updated summary of the text content
 *           example: "A brief summary of the original text content."
 *
 *     UpdateTextSummaryParams:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the text summary to update
 *           example: "text_abc123"
 */
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
            summary: Joi.string().optional().messages({
                "any.required": "Loan status is required",
                "string.empty": "Name cannot be empty",
            }),
        }),
    },
};
