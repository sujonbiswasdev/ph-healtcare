import z from "zod";

const createSpecialtyZodSchema = z.object({
    title : z.string("Title is required").optional(),
    description : z.string("Description is required").optional(),
})

export const SpecialtyValidation = {
    createSpecialtyZodSchema
}