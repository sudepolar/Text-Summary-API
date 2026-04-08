/**
 * HTTP status codes used throughout the application
 */
export const HTTP_STATUS = {
    // Success responses
    OK: 200,
    CREATED: 201,

    // Client error responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, // For authentication errors (invalid token)
    FORBIDDEN: 403, // For authorization errors (insufficient role)
    NOT_FOUND: 404,

    // Server error responses
    INTERNAL_SERVER_ERROR: 500,
} as const;