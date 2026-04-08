import { db } from "../../../../config/firebaseConfig";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

type FirestoreDataTypes =
    | string
    | number
    | boolean
    | null
    | Timestamp
    | FieldValue;

interface FieldValuePair {
    fieldName: string;
    fieldValue: FirestoreDataTypes;
}

/**
 * Executes a series of operations within a Firestore transaction.
 * @param {(transaction: FirebaseFirestore.Transaction) => Promise<T>} operations - Function containing the operations to perform within the transaction.
 * @returns {Promise<T>} - The result of the transaction.
 */
export const runTransaction = async <T>(
    operations: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> => {
    try {
        return await db.runTransaction(operations);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Transaction failed: ${errorMessage}`);
    }
};

/**
 * Creates a new document in a specified Firestore collection.
 * @param {string} collectionName - The name of the collection.
 * @param {Partial<T>} data - The data for the new document.
 * @returns {Promise<string>} - The ID of the newly created document.
 */
export const createDocument = async <T>(
    collectionName: string,
    data: Partial<T>,
    id?: string
): Promise<string> => {
    try {
        let docRef: FirebaseFirestore.DocumentReference;

        if (id) {
            docRef = db.collection(collectionName).doc(id);
            await docRef.set(data);
        } else {
            docRef = await db.collection(collectionName).add(data);
        }

        return docRef.id;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to create document in ${collectionName}: ${errorMessage}`
        );
    }
};

/**
 * Retrieves all documents from a specified Firestore collection.
 * @param {string} collectionName - The name of the collection.
 * @returns {Promise<FirebaseFirestore.QuerySnapshot>} - A QuerySnapshot containing all documents.
 */
export const getDocuments = async (
    collectionName: string
): Promise<FirebaseFirestore.QuerySnapshot> => {
    try {
        return await db.collection(collectionName).get();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to fetch documents from ${collectionName}: ${errorMessage}`
        );
    }
};

/**
 * Retrieves a document by its ID from a specified Firestore collection.
 * @param {string} collectionName - The name of the collection.
 * @param {string} id - The ID of the document to retrieve.
 * @returns {Promise<FirebaseFirestore.DocumentSnapshot | null>} - The document or null if it doesn't exist.
 */
export const getDocumentById = async (
    collectionName: string,
    id: string
): Promise<FirebaseFirestore.DocumentSnapshot | null> => {
    try {
        const doc: FirebaseFirestore.DocumentSnapshot = await db
            .collection(collectionName)
            .doc(id)
            .get();
        return doc?.exists ? doc : null;
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to fetch document ${id} from ${collectionName}: ${errorMessage}`
        );
    }
};

/**
 * Retrieves documents from a specified collection based on multiple field values.
 * @param {string} collectionName - The name of the collection to query.
 * @param {FieldValuePair[]} fieldValuePairs - An array of field-value pairs to filter on.
 * @returns {Promise<FirebaseFirestore.QuerySnapshot>} - A QuerySnapshot containing matching documents.
 */
export const getDocumentsByFieldValues = async (
    collectionName: string,
    fieldValuePairs: FieldValuePair[]
): Promise<FirebaseFirestore.QuerySnapshot> => {
    try {
        let query: FirebaseFirestore.Query = db.collection(collectionName);

        // Apply all field-value filters
        fieldValuePairs.forEach(({ fieldName, fieldValue }) => {
            query = query.where(fieldName, "==", fieldValue);
        });

        return await query.get();
    } catch (error: unknown) {
        const fieldValueString: string = fieldValuePairs
            .map(({ fieldName, fieldValue }) => `${fieldName} == ${fieldValue}`)
            .join(" AND ");
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to fetch documents from ${collectionName} where ${fieldValueString}: ${errorMessage}`
        );
    }
};

/**
 * Updates an existing document in a specified Firestore collection.
 * @param {string} collectionName - The name of the collection.
 * @param {string} id - The ID of the document to update.
 * @param {Partial<T>} data - The updated document data.
 * @returns {Promise<void>}
 */
export const updateDocument = async <T>(
    collectionName: string,
    id: string,
    data: Partial<T>
): Promise<void> => {
    try {
        await db.collection(collectionName).doc(id).update(data);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to update document ${id} in ${collectionName}: ${errorMessage}`
        );
    }
};

/**
 * Deletes a document from a specified Firestore collection.
 * Can operate within a transaction if provided, otherwise performs a direct delete.
 * @param {string} collectionName - The name of the collection.
 * @param {string} id - The ID of the document to delete.
 * @param {FirebaseFirestore.Transaction} [transaction] - Optional Firestore transaction.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (
    collectionName: string,
    id: string,
    transaction?: FirebaseFirestore.Transaction
): Promise<void> => {
    try {
        const docRef: FirebaseFirestore.DocumentReference = db
            .collection(collectionName)
            .doc(id);
        if (transaction) {
            transaction.delete(docRef);
        } else {
            await docRef.delete();
        }
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to delete document ${id} from ${collectionName}: ${errorMessage}`
        );
    }
};

/**
 * Deletes documents from a specified collection based on multiple field values.
 * Can operate within a transaction if provided, otherwise performs a batch delete.
 * @param {string} collectionName - The name of the collection to delete from.
 * @param {FieldValuePair[]} fieldValuePairs - An array of field-value pairs to filter on.
 * @param {FirebaseFirestore.Transaction} [transaction] - Optional Firestore transaction object.
 * @returns {Promise<void>}
 */
export const deleteDocumentsByFieldValues = async (
    collectionName: string,
    fieldValuePairs: FieldValuePair[],
    transaction?: FirebaseFirestore.Transaction
): Promise<void> => {
    try {
        let query: FirebaseFirestore.Query = db.collection(collectionName);

        // Apply all field-value filters
        fieldValuePairs.forEach(({ fieldName, fieldValue }) => {
            query = query.where(fieldName, "==", fieldValue);
        });

        let snapshot: FirebaseFirestore.QuerySnapshot;

        if (transaction) {
            snapshot = await transaction.get(query);
            snapshot.docs.forEach((doc) => {
                transaction.delete(doc.ref);
            });
        } else {
            snapshot = await query.get();
            const batch: FirebaseFirestore.WriteBatch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
    } catch (error: unknown) {
        const fieldValueString: string = fieldValuePairs
            .map(({ fieldName, fieldValue }) => `${fieldName} == ${fieldValue}`)
            .join(" AND ");
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(
            `Failed to delete documents from ${collectionName} where ${fieldValueString}: ${errorMessage}`
        );
    }
};
