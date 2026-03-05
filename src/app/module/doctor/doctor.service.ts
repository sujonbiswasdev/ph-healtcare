
// import { QueryBuilder } from './../../utils/queryBulder';
import { prisma } from "../../lib/prisma";
// import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from './doctor.constant';
import { IQueryParams } from '../../interface/query.interface';
import { QueryBuilder } from "../../utils/queryBulder";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";

const getAllDoctors = async (query : IQueryParams) => {
    // const doctors = await prisma.doctor.findMany({
    //     where: {
    //         isDeleted: false,
    //     },
    //     include: {
    //         user: true,
    //         specialties: {
    //             include: {
    //                 specialty: true
    //             }
    //         }
    //     }
    // })

    // console.log(doctors,'doctors')

    // const query = new QueryBuilder().paginate().search().filter();
    // return doctors;

    const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: doctorFilterableFields,
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
            // specialties: true,
            specialties: {
                include:{
                    specialty: true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    return result;
}
// const getDoctorById = async (id: string) => {}

// const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {}

// const deleteDoctor = async (id: string) => {} //soft delete

export const DoctorService = {
    getAllDoctors,
}