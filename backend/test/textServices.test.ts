import * as textService from "../src/api/v1/services/textServices";
import * as firestoreRepository from "../src/api/v1/repositories/firestoreRepository";
import * as fileExtractor from "../src/api/v1/utils/fileExtractor";
import * as llmClient from "../src/api/v1/utils/llmClient";
import { Text } from "../src/api/v1/models/textModel";

jest.mock("../src/api/v1/repositories/firestoreRepository");
jest.mock("../src/api/v1/utils/fileExtractor");
jest.mock("../src/api/v1/utils/llmClient");

describe("Text Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createText", () => {
        it("should create a text summary from raw text content", async () => {
            const textData = {
                subject: "Black Holes",
                textContent: "A black hole is a region of spacetime where gravity is so strong that nothing can escape.",
            };
            const generatedSummary = "A concise overview of black holes.";
            const documentId = "text-hello";

            (llmClient.summarizeText as jest.Mock).mockResolvedValue(generatedSummary);
            (firestoreRepository.createDocument as jest.Mock).mockResolvedValue(documentId);

            const result: Text = await textService.createText(textData);

            expect(llmClient.summarizeText).toHaveBeenCalledWith(textData.textContent);
            expect(firestoreRepository.createDocument).toHaveBeenCalledWith(
                "items",
                expect.objectContaining({
                    subject: textData.subject,
                    textContent: textData.textContent,
                    summary: generatedSummary,
                    file: null,
                    createdAt: expect.any(Date),
                })
            );
            expect(result.id).toBe(documentId);
            expect(result.subject).toBe(textData.subject);
            expect(result.summary).toBe(generatedSummary);
            expect(result.file).toBeNull();
        });

        it("should create a text summary from an uploaded file", async () => {
            const textData = { subject: "String Theory", textContent: "" };
            const file = {
                originalname: "notes.pdf",
                mimetype: "application/pdf",
                size: 2048,
                buffer: Buffer.from("file content"),
            } as Express.Multer.File;
            const extractedText = "Strings all the way down.";
            const generatedSummary = "An introduction to string theory.";
            const documentId = "text-strings";

            (fileExtractor.extractTextFromFile as jest.Mock).mockResolvedValue(extractedText);
            (llmClient.summarizeText as jest.Mock).mockResolvedValue(generatedSummary);
            (firestoreRepository.createDocument as jest.Mock).mockResolvedValue(documentId);

            const result: Text = await textService.createText(textData, file);

            expect(fileExtractor.extractTextFromFile).toHaveBeenCalledWith(file);
            expect(llmClient.summarizeText).toHaveBeenCalledWith(extractedText);
            expect(firestoreRepository.createDocument).toHaveBeenCalledWith(
                "items",
                expect.objectContaining({
                    subject: textData.subject,
                    textContent: extractedText,
                    summary: generatedSummary,
                    file: expect.objectContaining({
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        sizeBytes: file.size,
                        uploadedAt: expect.any(Date),
                    }),
                })
            );
            expect(result.id).toBe(documentId);
            expect(result.summary).toBe(generatedSummary);
            expect(result.file).not.toBeNull();
        });
    });

    describe("getTextById", () => {
        it("should fetch a text summary by id", async () => {
            const docId = "text-meme";
            const mockText: Text = {
                id: docId,
                subject: "Quantum Physics",
                textContent: "Quantum physics is wild.",
                summary: "A brief overview of quantum physics.",
                file: null,
                createdAt: new Date(),
            };

            jest.spyOn(textService, "getTextById").mockResolvedValue(mockText);

            const result = await textService.getTextById(docId);

            expect(textService.getTextById).toHaveBeenCalledWith(docId);
            expect(result).toEqual(mockText);
        });

        it("should throw an error if the text summary is not found", async () => {
            const textId = "text-does-not-exist";

            jest.restoreAllMocks();
            (firestoreRepository.getDocumentById as jest.Mock).mockResolvedValue(null);

            await expect(textService.getTextById(textId))
                .rejects
                .toThrow(`Item with Id ${textId} not found`);
        });
    });

    describe("updateText", () => {
        it("should update a text summary's summary field", async () => {
            const textId = "text-1989";
            const existingText: Text = {
                id: textId,
                subject: "Relativity",
                textContent: "Old content about relativity.",
                summary: "An old summary.",
                file: null,
                createdAt: new Date(),
            };

            jest.spyOn(textService, "getTextById").mockResolvedValue(existingText);
            (firestoreRepository.updateDocument as jest.Mock).mockResolvedValue(undefined);

            const updateData = { summary: "Updated summary about relativity." };

            const result = await textService.updateText(textId, updateData);

            expect(textService.getTextById).toHaveBeenCalledWith(textId);
            expect(firestoreRepository.updateDocument).toHaveBeenCalledWith(
                "items",
                textId,
                expect.objectContaining({
                    subject: existingText.subject,
                    summary: updateData.summary,
                    createdAt: existingText.createdAt,
                })
            );
            expect(result.id).toBe(textId);
            expect(result.summary).toBe(updateData.summary);
        });
    });

    describe("deleteText", () => {
        it("should delete a text summary by id", async () => {
            const textId = "text-goat";
            const mockText: Text = {
                id: textId,
                subject: "String Theory",
                textContent: "Strings all the way down.",
                summary: "An intro to string theory.",
                file: null,
                createdAt: new Date(),
            };

            jest.spyOn(textService, "getTextById").mockResolvedValue(mockText);
            (firestoreRepository.deleteDocument as jest.Mock).mockResolvedValue(undefined);

            await textService.deleteText(textId);

            expect(textService.getTextById).toHaveBeenCalledWith(textId);
            expect(firestoreRepository.deleteDocument).toHaveBeenCalledWith("items", textId);
        });
    });

    describe("getAllTexts", () => {
        it("should return all text summaries", async () => {
            const mockDocs = [
                {
                    id: "text-1",
                    data: () => ({
                        subject: "Topic A",
                        textContent: "Content A",
                        summary: "Summary A",
                        file: null,
                        createdAt: { toDate: () => new Date() },
                    }),
                },
                {
                    id: "text-2",
                    data: () => ({
                        subject: "Topic B",
                        textContent: "Content B",
                        summary: "Summary B",
                        file: null,
                        createdAt: { toDate: () => new Date() },
                    }),
                },
            ];
            (firestoreRepository.getDocuments as jest.Mock).mockResolvedValue({ docs: mockDocs });

            const result = await textService.getAllTexts();

            expect(firestoreRepository.getDocuments).toHaveBeenCalledWith("items");
            expect(result).toHaveLength(2);
            expect(result[0].subject).toBe("Topic A");
            expect(result[0].summary).toBe("Summary A");
            expect(result[1].subject).toBe("Topic B");
            expect(result[1].summary).toBe("Summary B");
        });
    });
});