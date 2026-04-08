import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../src/constants/httpConstants";
import * as textController from "../src/api/v1/controllers/textController";
import * as textServices from "../src/api/v1/services/textServices";
import { Text } from "../src/api/v1/models/textModel";
import { successResponse } from "../src/api/v1/models/responseModel";

jest.mock("../src/api/v1/services/textServices");

describe("Text Controller", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = { params: {}, body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe("getAllTexts", () => {
        it("should handle successful retrieval", async () => {
            const mockTexts: Text[] = [
                { id: "text-1", subject: "Winnipeg History", textContent: "Winnipeg was founded in 1873.", createdAt: new Date() },
            ];
            (textServices.getAllTexts as jest.Mock).mockResolvedValue(mockTexts);

            await textController.getAllTexts(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Text applications retrieved",
                count: mockTexts.length,
                data: mockTexts,
            });
        });
    });

    describe("createText", () => {
        it("should handle successful creation", async () => {
            const mockBody = { subject: "Black Holes", textContent: "A black hole is a region of spacetime with extreme gravity." };
            const mockText: Text = { id: "text-21", ...mockBody, createdAt: new Date() };

            mockReq.body = mockBody;
            (textServices.createText as jest.Mock).mockResolvedValue(mockText);

            await textController.createText(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
            expect(mockRes.json).toHaveBeenCalledWith(
                successResponse(mockText, "Text summary created")
            );
        });
    });

    describe("updateText", () => {
        it("should handle successful update", async () => {
            const textId = "text-something";
            const mockBody = { textContent: "Updated content about quantum physics." };
            const updatedText: Text = { id: textId, subject: "Quantum Physics", textContent: mockBody.textContent, createdAt: new Date() };

            mockReq.params = { id: textId };
            mockReq.body = mockBody;
            (textServices.updateText as jest.Mock).mockResolvedValue(updatedText);

            await textController.updateText(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockRes.json).toHaveBeenCalledWith(
                successResponse(updatedText, "Text Summary updated")
            );
        });
    });

    describe("deleteText", () => {
        it("should handle successful deletion", async () => {
            const textId = "text-bye-bye";
            mockReq.params = { id: textId };
            (textServices.deleteText as jest.Mock).mockResolvedValue(undefined);

            await textController.deleteText(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockRes.json).toHaveBeenCalledWith(
                successResponse("Loan summary successfully deleted")
            );
        });
    });

    describe("getTextById", () => {
        it("should handle successful retrieval by ID", async () => {
            const textId = "text-brainrot";
            const mockText: Text = { id: textId, subject: "String Theory", textContent: "Strings all the way down.", createdAt: new Date() };

            mockReq.params = { id: textId };
            (textServices.getTextById as jest.Mock).mockResolvedValue(mockText);

            await textController.getTextById(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockRes.json).toHaveBeenCalledWith(
                successResponse(mockText, "Text retrieved successfully")
            );
        });

        it("should handle not found error", async () => {
            const textId = "text-does-not-exist";
            mockReq.params = { id: textId };
            (textServices.getTextById as jest.Mock).mockRejectedValue(new Error("Not found"));

            await textController.getTextById(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Text not found",
            });
        });
    });
});