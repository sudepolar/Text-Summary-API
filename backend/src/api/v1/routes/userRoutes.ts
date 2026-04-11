import express, { Router } from "express";
import { getUserDetails } from "../controllers/userController";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Retrieve details of a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user to retrieve
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/validations/UserDetailsResponse'
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient permissions (requires admin or same user)
 *       '404':
 *         description: Not found - User with given ID does not exist
 */
router.get(
    "/:id",
    authenticate,
    isAuthorized({ hasRole: ["admin"], allowSameUser: true }),
    getUserDetails
);

export default router;
