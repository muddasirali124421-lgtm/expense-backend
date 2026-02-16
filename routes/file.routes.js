import express from "express";
import {
  uploadFile,
  listFiles,
  getFile,
  deleteFile,
  updateFile,
  uploadSingle,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/", uploadSingle, uploadFile);
router.get("/", listFiles);
router.get("/:filename", getFile);
router.delete("/:filename", deleteFile);
router.put("/:filename", uploadSingle, updateFile);

export default router;
