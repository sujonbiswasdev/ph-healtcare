import { createClient, RedisClientType } from 'redis';
import { envVars } from '../config/env';

class RedisService {
    private client: RedisClientType | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        try {
            const redisUrl = envVars.REDIS_URL;
            this.client = createClient({ url: redisUrl });
            this.client.on('error', (err) => {
                this.isConnected = false
                console.error('Redis Client Error', err)
            });

            this.client.on("connect", () => {
                console.log("Redis Client conected")
                this.isConnected = true
            })
            this.client.on("ready", () => {
                console.log("Redis Client Ready")
                this.isConnected = true
            })

            this.client.on("end", () => {
                console.log("Redis Client Disconected")
                this.isConnected = false
            })

            this.client.on("reconnecting", () => {
                console.log("Redis Client reconnecting")
                this.isConnected = true
            })

            await this.client.connect();

        } catch (error) {
            console.error('Error connecting to Redis:', error);
            this.isConnected = false
        }
    }
    private ensureConection(): RedisClientType {
        if (!this.client) {
            throw new Error("Redis client Not initialized. call connect() first.")
        }
        if (!this.isConnected) {
            throw new Error("Redis client not connected")
        }
        return this.client
    }
    async get(key: string): Promise<string | null> {

        try {
            const client = this.ensureConection();
            return client.get(key)
            return null
        } catch (error) {
            console.error("Redis get error")
            return null
        }
    }
    async set(key: string, value: any, ttlInSecound: number): Promise<void> {
        try {
            const client = this.ensureConection();
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);
            await client.set(key, stringValue, { EX: ttlInSecound })
        } catch (err) {
            console.error("Redis SET error:",err)
        }
    }

    async update(key:string,value:any,ttlInSecounds:number):Promise<void>{
        await this.set(key,value,ttlInSecounds)
    }
    async delete(key:string):Promise<void>{
        try {
            const client = this.ensureConection();
            await client.del(key)
        } catch (error) {
            console.log("Redis DELETE ERROR:",error)
        }
    }
    async isAvalilable():Promise<boolean>{
      try {
          const client = this.ensureConection();
        await client.ping();
        return true
      } catch (error) {
        console.error("",error)
        return false
      }
    }
    async disconnect():Promise<void>{
        if(this.client && this.isConnected){
            await this.client.quit();
            this.isConnected=false
        }
    }
}

export const redisService = new RedisService()

