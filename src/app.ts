import express, { Application, Request, Response } from "express";
import cookieParser from 'cookie-parser';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from 'cors'
import { IndexRouter } from "./app/routes";
import AppError from "./app/errorhelper/AppError";
import { Notfound } from "./app/middleware/Notfound";

const app: Application = express();

app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )
app.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  // TODO: Implement webhook processing logic
  // Example: Verify webhook signature, process payload
  res.status(200).json({ received: true });
});

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
app.get('/',async(req:Request,res:Response)=>{
    res.status(200).json({message:"this is home route"})
    // throw new AppError(404,'notfound','nod')
})

app.use("/api",IndexRouter.router)
// notfound
app.use(Notfound)

export default app;