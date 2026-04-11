/**
 * Represents a text file
 */

export interface Text {
    id: string;
    subject: string;
    textContent: string;
    summary: string;
    file: FileMetadata | null;
    createdAt: Date;
}

/**
 * Represents file meta data
 */
export interface FileMetadata {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: Date;
}