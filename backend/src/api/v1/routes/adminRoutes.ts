import express, { Router } from "express";
import { setCustomClaims } from "../controllers/adminController";
import authenticate from "../middleware/authenticate";

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/admin/setCustomClaims:
 *   post:
 *     summary: Set custom claims on a user's authentication token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/validations/SetCustomClaimsRequest'
 *     responses:
 *       '200':
 *         description: Custom claims set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/validations/SetCustomClaimsResponse'
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient permissions to set custom claims
 *       '404':
 *         description: Not found - Target user does not exist
 */
router.post(
    "/setCustomClaims",
    authenticate,
    setCustomClaims
);

export default router;
