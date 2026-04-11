import fs from "fs";
import { generateSwaggerSpec } from "../../../config/swaggerOptions";

// Get the specs using our shared configuration
const specs = generateSwaggerSpec();

// Write specs to a JSON file
fs.writeFileSync("./openapi.json", JSON.stringify(specs, null, 2));

console.log("OpenAPI specification generated successfully!");