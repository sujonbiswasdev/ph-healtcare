import { Router } from "express";
import { RagController } from "./rag.controller";

const router =Router();

router.post("/ingest-doctor",RagController.ingestDoctor)

export const ragRoute = router;