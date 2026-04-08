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
    subject: string;
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

/**
 * Updates an existing text summary object
 * @param id - The ID of the text summary object
 * @param textData - The fields to update
 * @returns the updated text
 * @throws Error if the item with the given ID is not found
 */
export const updateText = async (
    id:string,
    textData: Pick<Text, "textContent">
) : Promise<Text> => {
    const text: Text = await getTextById(id);
    if (!text) {
        throw new Error(`Text Summary with ID ${id} not found`);
    }

    
    const updateText: Text= {
        ...text,
        // Required: formatting issues occurred, createdAt needs to be last.
        createdAt: text.createdAt,
    };


    await updateDocument<Text>(COLLECTION, id, updateText);
    
    return structuredClone(updateText);
}

/**
 * Deletes a text summary from database
 * @params id - The ID of the item to delete
 * @throws Error if item with given ID is not found
 */
export const deleteText = async(id:string): Promise<void> => {
    const text: Text =await getTextById(id);
    if (!text) {
        throw new Error(`Text summary not found`)
    }

    await deleteDocument(COLLECTION, id);
}