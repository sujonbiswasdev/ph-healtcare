import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";
import AppError from "./app/errorHelper/AppError";
import cookieParser from 'cookie-parser';
import status from "http-status";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from 'cors'

const app: Application = express();

app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )

app.use('/api/auth',toNodeHandler(auth))
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));




// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1", IndexRoutes);



app.get('/test', async (req: Request, res: Response) => {
    throw new AppError(status.BAD_REQUEST,'notfound')
});


// Basic route
app.get('/', async (req: Request, res: Response) => {

    const specialty = await prisma.specialty.create({
        data: {
            title: 'ssssssssssssss'
        }
    })
    res.status(201).json({
        success: true,
        message: 'API is working',
        data: specialty
    })
});


app.use(globalErrorHandler)
app.use(notFound)

export default app;