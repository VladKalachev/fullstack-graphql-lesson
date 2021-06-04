import { MikroORM } from '@mikro-orm/core';
// import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';
import express, {Request, Response} from 'express';

const main = async () => {
    const orm =  await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const app = express();
    app.get('/', (_: Request, res: Response) => {
        res.send('Hello');
    });
    app.listen(4000, () => {
        console.log('Server started on localhost:4000')
    })
};

main().catch((err) => {
    console.error(err);
});
