import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../src/constants/httpConstants";
import * as textController from "../src/api/v1/controllers/textController";
import * as textServices from "../src/api/v1/services/textServices";
import { Text } from "../src/api/v1/models/textModel";
import { successResponse } from "../src/api/v1/models/responseModel";

jest.mock("../src/api/v1/services/textServices");

describe("Text Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { params: {}, body: {}, file: undefined };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe("getAllTexts", () => {
        it("should return all texts with a count", async () => {
            const texts: Text[] = [
                {
                    id: "thisisarandomid",
                    subject: "Winnipeg History",
                    textContent: "Winnipeg was founded in 1873.",
                    summary: "A brief history of Winnipeg.",
                    file: null,
                    createdAt: new Date(),
                },
            ];
            (textServices.getAllTexts as jest.Mock).mockResolvedValue(texts);

            await textController.getAllTexts(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(res.json).toHaveBeenCalledWith({
                message: "Text applications retrieved",
                count: texts.length,
                data: texts,
            });
        });

        it("should forward errors to the next middleware", async () => {
            const error = new Error("Database unavailable");
            (textServices.getAllTexts as jest.Mock).mockRejectedValue(error);

            await textController.getAllTexts(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("createText", () => {
        it("should create a text entry and return it", async () => {
            const body = { subject: "Black Holes", textContent: "A black hole is a region of spacetime with extreme gravity." };
            const file = { originalname: "notes.pdf", mimetype: "application/pdf", size: 1024 } as Express.Multer.File;
            const created: Text = {
                id: "text-21",
                subject: body.subject,
                textContent: body.textContent,
                summary: "An overview of black holes.",
                file: {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                    uploadedAt: new Date(),
                },
                createdAt: new Date(),
            };

            req.body = body;
            req.file = file;
            (textServices.createText as jest.Mock).mockResolvedValue(created);

            await textController.createText(req as Request, res as Response, next);

            expect(textServices.createText).toHaveBeenCalledWith({ subject: body.subject, textContent: body.textContent }, file);
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
            expect(res.json).toHaveBeenCalledWith(successResponse(created, "Text summary created"));
        });

        it("should forward errors to the next middleware", async () => {
            const error = new Error("Creation failed");
            req.body = { subject: "Test", textContent: "Some content" };
            (textServices.createText as jest.Mock).mockRejectedValue(error);

            await textController.createText(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateText", () => {
        it("should update a text entry and return it", async () => {
            const textId = "text-something";
            const body = { summary: "Updated content about quantum physics." };
            const updated: Text = {
                id: textId,
                subject: "Quantum Physics",
                textContent: "The study of matter at the smallest scales.",
                summary: body.summary,
                file: null,
                createdAt: new Date(),
            };

            req.params = { id: textId };
            req.body = body;
            (textServices.updateText as jest.Mock).mockResolvedValue(updated);

            await textController.updateText(req as Request, res as Response, next);

            expect(textServices.updateText).toHaveBeenCalledWith(textId, { summary: body.summary });
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(res.json).toHaveBeenCalledWith(successResponse(updated, "Text Summary updated"));
        });

        it("should forward errors to the next middleware", async () => {
            const error = new Error("Update failed");
            req.params = { id: "text-something" };
            req.body = { summary: "Some update" };
            (textServices.updateText as jest.Mock).mockRejectedValue(error);

            await textController.updateText(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteText", () => {
        it("should delete a text entry and confirm it", async () => {
            const textId = "text-bye-bye";
            req.params = { id: textId };
            (textServices.deleteText as jest.Mock).mockResolvedValue(undefined);

            await textController.deleteText(req as Request, res as Response, next);

            expect(textServices.deleteText).toHaveBeenCalledWith(textId);
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(res.json).toHaveBeenCalledWith(successResponse("Loan summary successfully deleted"));
        });

        it("should forward errors to the next middleware", async () => {
            const error = new Error("Deletion failed");
            req.params = { id: "text-bye-bye" };
            (textServices.deleteText as jest.Mock).mockRejectedValue(error);

            await textController.deleteText(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getTextById", () => {
        it("should return a text entry by its ID", async () => {
            const textId = "text-brainrot";
            const text: Text = {
                id: textId,
                subject: "String Theory",
                textContent: "Strings all the way down.",
                summary: "An introduction to string theory.",
                file: null,
                createdAt: new Date(),
            };

            req.params = { id: textId };
            (textServices.getTextById as jest.Mock).mockResolvedValue(text);

            await textController.getTextById(req as Request, res as Response, next);

            expect(textServices.getTextById).toHaveBeenCalledWith(textId);
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(res.json).toHaveBeenCalledWith(successResponse(text, "Text retrieved successfully"));
        });

        it("should return a 404 when the text entry does not exist", async () => {
            req.params = { id: "text-does-not-exist" };
            (textServices.getTextById as jest.Mock).mockRejectedValue(new Error("Not found"));

            await textController.getTextById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(res.json).toHaveBeenCalledWith({ message: "Text not found" });
        });
    });
});