import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { CatModule } from './cat/cat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { ApolloError, ValidationError } from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { IsYearMonth } from './common/class-validator/is-year-month';

if (!process.env.MONGO_DATABASE) {
  throw new Error('process.env.MONGO_DATABASE is not defined');
}

if (!process.env.MONGO_URL) {
  throw new Error('process.env.MONGO_URL is not defined');
}

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            if (!connectionParams.authorization) {
              throw new ApolloError(
                `Send 'authorization' property with an appropriate token in connection with websockets`,
              );
            }
            return { connectionParams };
          },
        },
      },
      formatError: (error: any) => {
        if (error instanceof GraphQLError) {
          const graphQLFormattedError: GraphQLFormattedError = {
            message:
              error.extensions?.exception?.response?.messag || error.message,
          };
          return graphQLFormattedError;
        } else if (error instanceof ApolloError) {
          if (!!error?.extensions?.response?.message) {
            return {
              message: error.extensions.response.message,
            };
          } else {
            return {
              message: error.message,
            };
          }
        }
      },
      context: ({ req, connection }) => {
        return connection ? { req: connection.context } : { req };
      },
    }),
    MongooseModule.forRoot(
      `${process.env.MONGO_URL}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
      {
        ignoreUndefined: true,
      },
    ),
    CatModule,
    AuthModule,
    TodoModule,
    IsYearMonth,
  ],
})
export class AppModule {}
