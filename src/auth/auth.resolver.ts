import { Resolver, Args, Query  } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthenticationError } from 'apollo-server-core';
import {User, UserInput} from "./auth.dto";

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) {}

    @Query(() => User)
    async login(@Args('userInput') input: UserInput) {
        const result = await this.authService.login(input);
        if (result) return result;
        throw new AuthenticationError(
            'Could not log-in with the provided credentials',
        );
    }

    // // There is no username guard here because if the person has the token, they can be any user
    // @Query('refreshToken')
    // @UseGuards(JwtAuthGuard)
    // async refreshToken(@Context('req') request: any): Promise<string> {
    //     const user: UserDocument = request.user;
    //     if (!user)
    //         throw new AuthenticationError(
    //             'Could not log-in with the provided credentials',
    //         );
    //     const result = await this.authService.createJwt(user);
    //     if (result) return result.token;
    //     throw new AuthenticationError(
    //         'Could not log-in with the provided credentials',
    //     );
    // }
}
