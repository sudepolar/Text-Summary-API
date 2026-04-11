/**
 * Represents a text file
 */

export interface Text {
    id: string;
    subject: string;
    textContent: string;
    createdAt: Date;
}

/**
 * Represents file meta data
 */
export interface FileMetaData {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
}