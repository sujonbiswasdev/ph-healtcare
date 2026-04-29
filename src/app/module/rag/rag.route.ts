import { Router } from "express";
import { RagController } from "./rag.controller";

const router =Router();

router.get("/stats",RagController.getStats)

router.post("/ingest-doctor",RagController.ingestDoctor)
router.post("/query",RagController.queryRag)

export const ragRoute = router;