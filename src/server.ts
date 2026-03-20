import { Server } from "http";
import app from "./app"
let server:Server
const port = 5000
const bootstrap = async() => {
    try {
        server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }   
}
bootstrap()