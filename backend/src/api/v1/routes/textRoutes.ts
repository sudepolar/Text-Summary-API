import express, {Router} from "express";
import { validateRequest } from "../middleware/validate";
import { itemSchemas } from "../validation/textValidation";
import * as textController from "../controllers/textController";
import { upload } from "../middleware/upload";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";
import { AuthorizationOptions } from "../models/authorizationOptions";

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/text-summary:
 *   get:
 *     summary: Retrieve all text summaries
 *     tags: [TextSummary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of all text summaries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TextSummaryListResponse'
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '400':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Insufficient role permissions (requires admin)
 */
router.get("/",
    authenticate,
    isAuthorized({ hasRole: ["admin",]} as AuthorizationOptions),
    textController.getAllTexts);

/**
 * @openapi
 * /api/v1/text-summary:
 *   post:
 *     summary: Create a new text summary with file upload
 *     tags: [TextSummary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload for text summarization
 *     responses:
 *       '201':
 *         description: Text summary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TextSummaryResponse'
 *       '400':
 *         description: Bad request - Invalid file or missing required fields
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient role permissions (requires admin or user)
 */
router.post(
    "/",
    authenticate,
    isAuthorized({ hasRole: ["admin", "user"]} as AuthorizationOptions),
    upload.single('file'),
    textController.createText);

/**
 * @openapi
 * /api/v1/text-summary/{id}:
 *   get:
 *     summary: Retrieve a text summary by ID
 *     tags: [TextSummary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the text summary
 *     responses:
 *       '200':
 *         description: Text summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient role permissions (requires admin or same user)
 *       '404':
 *         description: Not found - Text summary with given ID does not exist
 */
router.get("/:id",
    authenticate,
    isAuthorized({
        hasRole: ["admin"],
        allowSameUser: true,
    } as AuthorizationOptions),
    textController.getTextById);

/**
 * @openapi
 * /api/v1/text-summary/{id}:
 *   put:
 *     summary: Update an existing text summary by ID
 *     tags: [TextSummary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the text summary to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/TextSummaryUpdateRequest'
 *     responses:
 *       '200':
 *         description: Text summary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TextSummaryResponse'
 *       '400':
 *         description: Bad request - Validation failed for request body
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient role permissions (requires admin or same user)
 *       '404':
 *         description: Not found - Text summary with given ID does not exist
 */
router.put(
    "/:id",
    authenticate,
    isAuthorized({
        hasRole: ["admin", "user"],
        allowSameUser: true
    } as AuthorizationOptions),
    validateRequest(itemSchemas.update),
    textController.updateText);

/**
 * @openapi
 * /api/v1/text-summary/{id}:
 *   delete:
 *     summary: Delete a text summary by ID
 *     tags: [TextSummary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the text summary to delete
 *     responses:
 *       '200':
 *         description: Text summary deleted successfully
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *       '403':
 *         description: Forbidden - Insufficient role permissions (requires admin)
 *       '404':
 *         description: Not found - Text summary with given ID does not exist
 */
router.delete(
    "/:id",
    authenticate,
    isAuthorized({ hasRole: ["admin"]} as AuthorizationOptions),
    textController.deleteText);

export default router;