import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AI Text Summary API Documentation",
            version: "1.0.0",
            description:
                "This is the API documentation for the Text summary application.",
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./backend/src/api/v1/routes/*.ts", "./backend/src/api/v1/validation/*.ts"], // Path to the API docs and schemas
};

// Generate the Swagger spec
export const generateSwaggerSpec = (): object => {
    return swaggerJsdoc(swaggerOptions);
};