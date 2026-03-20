import { Request } from 'express';
import { IRequestUser } from './request.user';
declare global{
    namespace Express{
        interface Request{
            user:IRequestUser
        }
    }

}