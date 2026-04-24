import Joi from "joi";
import { RequestSchema } from "../middleware/validate";
/**
 * @openapi
 * components:
 *   schemas:
 *     SetCustomClaimsRequest:
 *       type: object
 *       required:
 *         - uid
 *         - role
 *       properties:
 *         uid:
 *           type: string
 *           description: The user ID to set custom claims on
 *           example: "user_abc123"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The role to assign to the user
 *           example: "admin"
 *     SetCustomClaimsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Custom claims set successfully"
 *     UserDetailsResponse:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "user_abc123"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role in the system
 *           example: "admin"
 */
export const setCustomClaimsSchema: RequestSchema = {
    body: Joi.object({
        uid: Joi.string().required(),
        role: Joi.string().valid("user", "admin").required(),
    }),
};