import { Router } from "express";
import { authRouters } from "../module/auth/auth.route";

const router=Router()
router.use("/auth",authRouters.router)
export const IndexRouter={router}