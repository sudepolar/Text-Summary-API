import express, {Router} from "express";
import { validateRequest } from "../middleware/validate";
import { itemSchemas } from "../validation/textValidation";
import * as textController from "../controllers/textController";

const router: Router = express.Router();

// "/api/v1/loans" prefixes all below routes
router.get("/",
    textController.getAllTexts);

// sequential order authenticate -> isAuthorized -> validateRequest -> createItem
router.post(
    "/",
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