import { Router } from "express";
import { SpecialtyController } from "./spacialty.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyValidation } from "./spacialty.validate";
const router = Router();

router.post('/',multerUpload.single("file"), validateRequest(SpecialtyValidation.createSpecialtyZodSchema),SpecialtyController.createSpecialty);
router.get('/', SpecialtyController.getAllSpecialties);
router.delete('/:id', SpecialtyController.deleteSpecialty);
export const SpecialtyRoutes = router;