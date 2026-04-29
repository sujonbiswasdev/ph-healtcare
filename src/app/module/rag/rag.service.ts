import { IndexingService } from "./indexing.service";

export class RagService{
    private indexService:IndexingService;
    constructor(){
        this.indexService=new IndexingService();
    }
    async ingestDoctorData(){
       return await this.indexService.indexDoctorData();
    }

}