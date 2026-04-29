import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";
const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;
export class IndexingService {
    private embeddingService: EmbeddingService;
    constructor() {
        this.embeddingService = new EmbeddingService();
    }

    async indexDocument(chunkKey: string,
        sourceType: string,
        sourceId: string,
        content: string,
        sourceLabel?: string,
        metadata?: Record<string, unknown>) {
        const embedding = await this.embeddingService.generateEmbedding(content)
        const vectorLiteral = toVectorLiteral(embedding)
        const result = await prisma.$executeRaw(Prisma.sql`
          INSERT INTO "document_embeddings"
        (
            "id",
          "chunkKey",
          "sourceType",
          "sourceId",
          "sourceLabel",
          "content",
          "metadata",
          "embedding",
          "updatedAt"
        )
        values(
             ${Prisma.raw("gen_random_uuid()")},
             ${chunkKey},
             ${sourceType},
             ${sourceId},
             ${sourceLabel},
             ${content},
             ${JSON.stringify(metadata || {})} :: jsonb,
              CAST(${vectorLiteral} AS vector),
              NOW()
        )
        ON CONFLICT ("chunkKey")
        DO UPDATE SET
            "sourceType" = EXCLUDED."sourceType",
          "sourceId" = EXCLUDED."sourceId",
          "sourceLabel" = EXCLUDED."sourceLabel",
          "content" = EXCLUDED."content",
          "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding",
          "isDeleted" = false,
          "deletedAt" = null,
          "updatedAt" = NOW()
            `
        )

    }

    async indexDoctorData() {
        try {
            const doctors = await prisma.doctor.findMany({
                where: { isDeleted: false },
                include: {
                    specialties: {
                        include: {
                            specialty: true
                        }
                    }, reviews: true
                }
            })

            let indexCount = 0

            for (const doctor of doctors) {
                const specialtiesList = doctor.specialties.map((d) => d.specialty.title)
                const reviewsText = doctor.reviews.map((r) => `review rating : ${r.rating} and comment : ${r.comment} || "not comment"`)

                const content = `
            Doctor Name : ${doctor.name},
            experience : ${doctor.experience},
            qualification : ${doctor.qualification},
            appointmentFee : ${doctor.appointmentFee},
            currentWorkingPlace : ${doctor.currentWorkingPlace},
            designation : ${doctor.designation},

             Average Rating: ${doctor.averageRating}/5
            Specialties: ${specialtiesList || "None listed"}
            Patient Reviews:
            ${reviewsText || "No reviews yet."}
            `
                const metadata = {
                    doctorId: doctor.id,
                    name: doctor.name,
                    specialties: doctor.specialties.map((ds) => ds.specialty.title),
                    averageRating: doctor.averageRating,
                    experience: doctor.experience,
                };

                const chunkKey = `doctor-${doctor.id}`;
                await this.indexDocument(
                    chunkKey,
                    "DOCTOR",
                    doctor.id,
                    content,
                    doctor.name,
                    metadata,
                );
                indexCount++
            }
            return {
                success: true,
                message: `Successfully Indexed ${indexCount} doctors.`,
                indexCount,
            };
        } catch (error) {
            console.log(error, 'indexing doctor error')
            throw error
        }



    }
}
