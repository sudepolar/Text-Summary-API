module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/backend/test/jest.setup.ts"],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
        "/config/",
        "backend/src/api/v1/constants/",
        "backend/src/api/v1/models/",
        "backend/src/api/v1/errors/",
        "backend/src/api/v1/middleware/",
        "backend/src/api/v1/repositories/",
        "backend/src/api/v1/utils/"
    ],
};