import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from '../config/domain/orm.config';
import { ConfigModule } from '@nestjs/config';
import { User } from './domain/entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(OrmConfig),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    {
      provide: 'BaseUrl',
      useFactory: () => {
        const env =
          process.env.PRODE_ENV ?? process.env.NODE_ENV ?? 'development';
        return env === 'live'
          ? process.env.LIVE
          : env === 'pr'
            ? process.env.TEST
            : process.env.DEVELOPMENT;
      },
    },
  ],
})
export class AppModule {}
