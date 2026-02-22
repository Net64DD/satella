import multer from "multer";
import { Router } from "express";
import {
  createPak,
  deletePak,
  downloadPak,
  listPaks,
  updatePak,
  uploadPak,
} from "../controller/cpak.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({
  limits: {
    fileSize: parseInt(process.env.CONTROLLER_PAK_MAX_SIZE || "256") * 1024,
  },
  storage: multer.memoryStorage(),
});

router.get("/", authMiddleware, listPaks);
router.post("/", authMiddleware, createPak);
router.put("/:pakId", upload.single("pak"), authMiddleware, uploadPak);
router.get("/:pakId", authMiddleware, downloadPak);
router.patch("/:pakId", authMiddleware, updatePak);
router.delete("/:pakId", authMiddleware, deletePak);

export default router;
