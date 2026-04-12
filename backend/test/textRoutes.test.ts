import request from "supertest";
import { Request, Response, NextFunction } from "express";
import app from "../src/app";
import * as textController from "../src/api/v1/controllers/textController";
import { HTTP_STATUS } from "../src/constants/httpConstants";

jest.mock("../src/api/v1/controllers/textController", () => ({
    getAllTexts: jest.fn((_req: Request, res: Response) =>
        res.status(HTTP_STATUS.OK).send()
    ),
    createText: jest.fn((_req: Request, res: Response) =>
        res.status(HTTP_STATUS.CREATED).send()
    ),
    getTextById: jest.fn((_req: Request, res: Response) =>
        res.status(HTTP_STATUS.OK).send()
    ),
    updateText: jest.fn((_req: Request, res: Response) =>
        res.status(HTTP_STATUS.OK).send()
    ),
    deleteText: jest.fn((_req: Request, res: Response) =>
        res.status(HTTP_STATUS.OK).send()
    ),
}));

jest.mock("../src/api/v1/middleware/validate", () => ({
    validateRequest: jest.fn(
        () => (_req: Request, _res: Response, next: NextFunction) => next()
    ),
}));

jest.mock("../src/api/v1/middleware/authenticate", () =>
    jest.fn((_req: Request, _res: Response, next: NextFunction) => next())
);

jest.mock("../src/api/v1/middleware/authorize", () =>
    jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next())
);

jest.mock("../src/api/v1/middleware/upload", () => ({
    upload: {
        single: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) => next()),
    },
}));

describe("Text Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const BASE_URL = "/api/v1/text-summary";

    describe(`GET ${BASE_URL}/`, () => {
        it("should call getAllTexts controller", async () => {
            await request(app).get(`${BASE_URL}/`);

            expect(textController.getAllTexts).toHaveBeenCalled();
        });
    });

    describe(`POST ${BASE_URL}/`, () => {
        it("should call createText controller with a file upload", async () => {
            await request(app)
                .post(`${BASE_URL}/`)
                .attach("file", Buffer.from("sample content"), "notes.pdf");

            expect(textController.createText).toHaveBeenCalled();
        });
    });

    describe(`GET ${BASE_URL}/:id`, () => {
        it("should call getTextById controller", async () => {
            await request(app).get(`${BASE_URL}/text-brainrot`);

            expect(textController.getTextById).toHaveBeenCalled();
        });
    });

    describe(`PUT ${BASE_URL}/:id`, () => {
        it("should call updateText controller with a summary update", async () => {
            const body = { summary: "Updated content about black holes." };

            await request(app)
                .put(`${BASE_URL}/text-brainrot`)
                .send(body);

            expect(textController.updateText).toHaveBeenCalled();
        });
    });

    describe(`DELETE ${BASE_URL}/:id`, () => {
        it("should call deleteText controller", async () => {
            await request(app).delete(`${BASE_URL}/text-brainrot`);

            expect(textController.deleteText).toHaveBeenCalled();
        });
    });
});