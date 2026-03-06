import { Server } from "http";
import app from "./app"
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";
let server:Server
const port = 5000
const bootstrap = async() => {
    try {
        await seedSuperAdmin();
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }   
}

process.on("uncaughtException",(error)=>{
  console.log("uncaught exception detected shutting down server",error)
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
    process.exit(1)
})

process.on("unhandledRejection",(error)=>{
  console.log("unhandle rejection detected shutting down server")
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
})


process.on("SIGTERM",(error)=>{
  console.log("unhandle sigterm detected shutting down server")
  if(server){
    server.close(()=>{
      process.exit(1)
    })
  }
  process.exit(1)
})
bootstrap()