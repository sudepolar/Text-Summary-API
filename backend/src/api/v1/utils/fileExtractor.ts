/**
 * extracts text from allows files
 * @param file - the file given
 * @returns a string format of the text
 */
export async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const extension = file.originalname.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return file.buffer.toString('utf-8');

    case 'pdf':
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse.default(file.buffer);
      return pdfData.text;

    case 'docx':
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;

    default:
      throw new Error(`Cannot extract text from file type: ${extension}`);
  }
}