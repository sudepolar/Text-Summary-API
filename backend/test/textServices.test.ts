import * as textService from "../src/api/v1/services/textServices";
import * as firestoreRepository from "../src/api/v1/repositories/firestoreRepository";
import { Text } from "../src/api/v1/models/textModel";

jest.mock("../src/api/v1/repositories/firestoreRepository");

describe("Text Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a text summary for a cool subject", async () => {
        // Arrange
        const mockTextData = {
            subject: "Black Holes",
            textContent: "A black hole is a region of spacetime where gravity is so strong that nothing can escape.",
        };
        const mockDocumentId = "text-hello";

        (firestoreRepository.createDocument as jest.Mock).mockResolvedValue(mockDocumentId);

        // Act
        const result: Text = await textService.createText(mockTextData);

        // Assert
        expect(firestoreRepository.createDocument).toHaveBeenCalledWith(
            "items",
            expect.objectContaining({
                subject: mockTextData.subject,
                textContent: mockTextData.textContent,
                createdAt: expect.any(Date),
            })
        );
        expect(result.id).toBe(mockDocumentId);
        expect(result.subject).toBe(mockTextData.subject);
        expect(result.textContent).toBe(mockTextData.textContent);
    });

    it("should fetch a text summary by id", async () => {
        // Arrange
        const mockDocId = "text-meme";
        const mockText: Text = {
            id: mockDocId,
            subject: "Quantum Physics",
            textContent: "Quantum physics is wild.",
            createdAt: new Date(),
        };

        jest.spyOn(textService, "getTextById").mockResolvedValue(mockText);

        // Act
        const result = await textService.getTextById(mockDocId);

        // Assert
        expect(textService.getTextById).toHaveBeenCalledWith(mockDocId);
        expect(result).toEqual(mockText);
    });

    it("should update a text summary's content", async () => {
        // Arrange
        const textId = "text-1989";
        const existingText: Text = {
            id: textId,
            subject: "Relativity",
            textContent: "Old content about relativity.",
            createdAt: new Date(),
        };

        jest.spyOn(textService, "getTextById").mockResolvedValue(existingText);
        (firestoreRepository.updateDocument as jest.Mock).mockResolvedValue(undefined);

        const updateData = { textContent: "Updated content about relativity." };

        // Act
        const result = await textService.updateText(textId, updateData);

        // Assert
        expect(textService.getTextById).toHaveBeenCalledWith(textId);
        expect(firestoreRepository.updateDocument).toHaveBeenCalledWith(
            "items",
            textId,
            expect.objectContaining({
                subject: existingText.subject,
                createdAt: existingText.createdAt,
            })
        );
        expect(result.id).toBe(textId);
        expect(result.subject).toBe(existingText.subject);
    });

    it("should delete a text summary", async () => {
        // Arrange
        const textId = "text-goat";
        const mockText: Text = {
            id: textId,
            subject: "String Theory",
            textContent: "Strings all the way down.",
            createdAt: new Date(),
        };

        jest.spyOn(textService, "getTextById").mockResolvedValue(mockText);
        (firestoreRepository.deleteDocument as jest.Mock).mockResolvedValue(undefined);

        // Act
        await textService.deleteText(textId);

        // Assert
        expect(textService.getTextById).toHaveBeenCalledWith(textId);
        expect(firestoreRepository.deleteDocument).toHaveBeenCalledWith("items", textId);
    });

    it("should get all text summaries", async () => {
        // Arrange
        const mockDocs = [
            { id: "text-1", data: () => ({ subject: "Topic A", textContent: "Content A", createdAt: { toDate: () => new Date() } }) },
            { id: "text-2", data: () => ({ subject: "Topic B", textContent: "Content B", createdAt: { toDate: () => new Date() } }) },
        ];
        (firestoreRepository.getDocuments as jest.Mock).mockResolvedValue({ docs: mockDocs });

        // Act
        const result = await textService.getAllTexts();

        // Assert
        expect(firestoreRepository.getDocuments).toHaveBeenCalledWith("items");
        expect(result).toHaveLength(2);
        expect(result[0].subject).toBe("Topic A");
        expect(result[1].subject).toBe("Topic B");
    });

    it("should throw error if text summary not found", async () => {
        // Arrange
        const textId = "text-inexistent";

        jest.restoreAllMocks();

        (firestoreRepository.getDocumentById as jest.Mock).mockResolvedValue(null);

        // Act & Assert
        await expect(textService.getTextById(textId))
            .rejects
            .toThrow(`Item with Id ${textId} not found`);
    });
});