import express, {Router} from "express";
import { validateRequest } from "../middleware/validate";
import { itemSchemas } from "../validation/textValidation";
import * as textController from "../controllers/textController";
import { upload } from "../middleware/upload";

const router: Router = express.Router();

// "/api/v1/text-summary" prefixes all below routes
router.get("/",
    textController.getAllTexts);

// sequential order authenticate -> isAuthorized -> validateRequest -> createItem
router.post(
    "/",
    upload.single('file'),
    textController.createText);

router.get("/:id",
    textController.getTextById);
    
router.put(
    "/:id",
    validateRequest(itemSchemas.update),
    textController.updateText);

router.delete(
    "/:id",
    textController.deleteText);

export default router;