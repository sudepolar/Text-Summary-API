import express, {Router} from "express";
import { validateRequest } from "../middleware/validate";
import { itemSchemas } from "../validation/textValidation";
import * as textController from "../controllers/textController";
import { upload } from "../middleware/upload";
import authenticate from "../middleware/authenticate";
import isAuthorized from "../middleware/authorize";
import { AuthorizationOptions } from "../models/authorizationOptions";

const router: Router = express.Router();

// "/api/v1/text-summary" prefixes all below routes
router.get("/",
    authenticate,
    isAuthorized({ hasRole: ["admin",]} as AuthorizationOptions),
    textController.getAllTexts);

// sequential order authenticate -> isAuthorized -> validateRequest -> createItem
router.post(
    "/",
    upload.single('file'),
    authenticate,
    isAuthorized({ hasRole: ["admin", "user"]} as AuthorizationOptions),
    textController.createText);

router.get("/:id",
    authenticate,
    isAuthorized({
        hasRole: ["admin"],
        allowSameUser: true,
    } as AuthorizationOptions),
    textController.getTextById);
    
router.put(
    "/:id",
    authenticate,
    isAuthorized({
        hasRole: ["admin", "user"],
        allowSameUser: true
    } as AuthorizationOptions),
    validateRequest(itemSchemas.update),
    textController.updateText);

router.delete(
    "/:id",
    authenticate,
    isAuthorized({ hasRole: ["admin"]} as AuthorizationOptions),
    textController.deleteText);

export default router;