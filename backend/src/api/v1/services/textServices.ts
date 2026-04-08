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
    const newLoan: Partial<Text> = {
        ...textData,
        createdAt: dateNow,
    }
    const loanId: string = await createDocument<Text>(COLLECTION, newLoan);

    return structuredClone({ id: loanId, ...newLoan} as Text);
}

