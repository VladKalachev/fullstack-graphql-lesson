import { User } from '../entities/User';
import { MyContext } from '../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, Query, Int, ObjectType} from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME } from '../constants';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => User, {nullable: true})
  async me( 
    @Ctx() {req, em}: MyContext
  ) {
    if (!req.session.userId){
      return null;
    };

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

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

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req}: MyContext 
  ): Promise<UserResponse> {
    if(options.username.length <= 2 ) {
      return {
        errors: [{
          field: "username",
          message: "length must be greater than 2"
        }]
      }
    }

    if(options.password.length <= 3 ) {
      return {
        errors: [{
          field: "password",
          message: "length must be greater than 3"
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username, 
      password: hashedPassword,
    });
    try {
       await em.persistAndFlush(user);
    } catch (err) {
      if(err.code === '23505') {
        return {
          errors: [{
            field: "username",
            message: "username already taken"
          }]
        }
      }
      console.log("message: ", err.message)
    }

    req.session.userId = user.id;
   
    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext 
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if(!user) {
      return {
        errors: [{
          field: "username",
          message: "that username doesn't exist",
        }]
      }
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: "password",
          message: "incorrect password",
        }]
      }
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    return {
      user
    };
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(User, { id });
    return true;
  }

  @Mutation(() => Boolean)
  logout(@Ctx() {req, res}: MyContext) {
    return new Promise(resolve => 
      req.session.destroy((err: any) => {
      res.clearCookie(COOKIE_NAME);
      if (err) {
        resolve(false);
        return;
      }

      resolve(true);
    })); 
  }
}
