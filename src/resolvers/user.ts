import { User } from '../entities/User';
import { MyContext } from '../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, Query, Int} from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {

  @Query(() => [User])
  users( 
    @Ctx() {em}: MyContext
  ): Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, { nullable: true })
  user(
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em}: MyContext 
  ) {
    const hashedPassword = argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username, 
      password: hashedPassword
    });
    await em.persistAndFlush(user);
    return user
  }
}
