import { Text } from "../models/textModel";

import {
    QuerySnapshot,
    DocumentData,
    DocumentSnapshot,
} from "firebase-admin/firestore";

import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
} from "../repositories/firestoreRepository";

const COLLECTION: string = "items";

/**
 * Gets all text summary items from storage
 * @returns Array of all text summaries
 */
export const getAllTexts = async(): Promise<Text[]> => {
    try {
        const snapshot: QuerySnapshot = await getDocuments(COLLECTION);
        const loans: Text[] = snapshot.docs.map((doc) => {
            const data: DocumentData = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
            } as Text; 
        });

        return loans;
    } catch (error: unknown) {
        throw error;
    }
}

/**
 * Creates a new text summary object
 * @param textData - The text data for the new text summary
 * @returns The created text summary with the generated ID
 */
export const createText = async(textData: {
    textData : string;
}): Promise<Text> => {
    const dateNow = new Date();
    const newText: Partial<Text> = {
        ...textData,
        createdAt: dateNow,
    }
    const textId: string = await createDocument<Text>(COLLECTION, newText);

    return structuredClone({ id: textId, ...newText} as Text);
}

/**
 * Retrieves a single text summary by ID from the firestore
 * @param id - This is the ID of the item to retrieve
 * @returns The text summary if found
 */
export const getTextById = async (id: string): Promise<Text> => {
    const doc: DocumentSnapshot | null = await getDocumentById(COLLECTION, id);

    if (!doc) {
        throw new Error(`Item with Id ${id} not found`);
    }

    const data: DocumentData | undefined = doc.data();
    // Required: otherwise data will be flagged as possible undefined in code below
    if (!data) throw new Error("Item data is missing");

    const text: Text = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : new Date())
    } as Text;

    return structuredClone(text);
}