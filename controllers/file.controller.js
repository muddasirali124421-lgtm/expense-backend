import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import multer from "multer";

const uploadDirFromEnv = process.env.UPLOAD_DIR || "uploads";
const resolvedUploadDir = path.isAbsolute(uploadDirFromEnv)
  ? uploadDirFromEnv
  : path.join(process.cwd(), uploadDirFromEnv);

const ensureUploadDirExists = () => {
  if (!fs.existsSync(resolvedUploadDir)) {
    fs.mkdirSync(resolvedUploadDir, { recursive: true });
  }
};

ensureUploadDirExists();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirExists();
    cb(null, resolvedUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadSingle = multer({ storage }).single("file");

const safeFileName = (fileName) => {
  const sanitized = path.basename(fileName);
  if (sanitized !== fileName) {
    throw new Error("Invalid filename");
  }
  return sanitized;
};

const buildFileMetadata = async (fileName) => {
  const stats = await fsPromises.stat(path.join(resolvedUploadDir, fileName));
  return {
    fileName,
    size: stats.size,
    lastModified: stats.mtime,
    url: `/uploads/${fileName}`,
  };
};

export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file provided" });
  }

  const { originalname, filename, mimetype, size } = req.file;

  return res.status(201).json({
    message: "File uploaded successfully",
    file: {
      originalName: originalname,
      fileName: filename,
      mimetype,
      size,
      url: `/uploads/${filename}`,
    },
  });
};

export const listFiles = async (req, res) => {
  try {
    ensureUploadDirExists();
    const files = await fsPromises.readdir(resolvedUploadDir);
    const metadata = await Promise.all(files.map(buildFileMetadata));
    return res.json({ files: metadata });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list files" });
  }
};

export const getFile = async (req, res) => {
  try {
    const fileName = safeFileName(req.params.filename);
    const filePath = path.join(resolvedUploadDir, fileName);

    await fsPromises.access(filePath);
    return res.sendFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    if (error.message === "Invalid filename") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to retrieve file" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const fileName = safeFileName(req.params.filename);
    const filePath = path.join(resolvedUploadDir, fileName);

    await fsPromises.unlink(filePath);
    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    if (error.message === "Invalid filename") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to delete file" });
  }
};

export const updateFile = async (req, res) => {
  try {
    const fileName = safeFileName(req.params.filename);
    const targetPath = path.join(resolvedUploadDir, fileName);

    await fsPromises.access(targetPath);

    if (!req.file) {
      return res.status(400).json({ message: "No replacement file provided" });
    }

    await fsPromises.unlink(targetPath);
    await fsPromises.rename(req.file.path, targetPath);

    return res.json({
      message: "File replaced successfully",
      file: {
        fileName,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${fileName}`,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "File not found" });
    }
    if (error.message === "Invalid filename") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to replace file" });
  }
};

export { uploadSingle };
