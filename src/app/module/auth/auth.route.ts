import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middleware/checkauth";
import { Role } from "../../../generated/prisma/enums";

const router=Router()
router.get("/register",authController.Createuser)
router.get("/login",authController.Createuser)
router.get("/me",authController.Createuser)
router.post("/refresh-token", authController.getNewToken)
router.post("/change-password", auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.changePassword)
router.post("/logout", auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN), authController.logoutUser)

router.post("/verify-email", authController.verifyEmail)
router.post("/forget-password", authController.forgetPassword)
router.post("/reset-password", authController.resetPassword)

export const authRouters={router}