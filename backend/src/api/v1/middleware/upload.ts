import multer from 'multer';
import path from 'path';

/** sets the file storage to memory */
const storage = multer.memoryStorage(); // store file in memory as a Buffer

/**
 * Filters the uploaded files
 * @param req - Request object
 * @param file - The file being uploaded, which is being provided by Multer
 * @param cb - Callback to accept or reject the file
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.txt', '.pdf', '.docx'];
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${extension}`));
  }
};

/**
 * The configured Multer upload middleware
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});