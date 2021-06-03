import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';

const main = async () => {
    const orm =  await MikroORM.init(mikroConfig);

    const post = orm.em.create(Post, { title: 'mt first post' });
    await orm.em.persistAndFlush(post);
    console.log('--------------sql 2------------------');
    await orm.em.nativeInsert(Post, {title: 'mt first post 2'});
};

main().catch((err) => {
    console.error(err);
});
