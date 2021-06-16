import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { RedisClient } from "redis";

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
    redis: RedisClient;
    req: Request & { session?: any };
    res: Response;
};
