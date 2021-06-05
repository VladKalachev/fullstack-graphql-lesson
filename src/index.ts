import { MikroORM } from '@mikro-orm/core';
// import { Post } from './entities/Post';
import 'reflect-metadata';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import redis from 'redis';
import session from 'express-session';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MyContext } from './types';

const main = async () => {
    const orm =  await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
      session({
          name: 'qid',
          store: new RedisStore({ 
            client: redisClient,
            disableTouch: true,
          }),
          cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__ // cookie only works in https
          },
          secret: 'a32jfasesdfasdrkmnxcv',
          resave: false,
      })
    );
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    })
};

main().catch((err) => {
    console.error(err);
});
