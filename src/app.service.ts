import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './domain/entity';
import { Repository } from 'typeorm';
import { isNil, pipe, tap, throwIf } from '@fxts/core';
import {
  findEmailRequestDto,
  FindPasswordRequestDto,
  JoinRequestDto,
} from './dto/request';
import { UserValidateDto } from './dto/auth/user.validate.dto';
import * as bcrypt from 'bcrypt';
import {
  GenerateAccessTokenDto,
  GenerateRefreshTokenDto,
} from './dto/auth/generate.token.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  @InjectRepository(User) private readonly userRepository: Repository<User>;

  async join(dto: JoinRequestDto): Promise<User> {
    return pipe(
      await this.userRepository.findOne({ where: { email: dto.email } }),
      throwIf(
        (data) => !!data,
        () =>
          new HttpException(
            '이미 존재하는 이메일 입니다.',
            HttpStatus.CONFLICT,
          ),
      ),
      async () =>
        await this.userRepository.save({
          ...dto,
          password: await bcrypt.hash(dto.password, 10),
        }),
    );
  }

  generateAccessToken(dto: GenerateAccessTokenDto) {
    return this.jwtService.sign(dto, { secret: process.env.JWT_SECRET });
  }

  generateRefreshToken(dto: GenerateRefreshTokenDto) {
    return this.jwtService.sign(dto, { secret: process.env.JWT_SECRET });
  }

  async findEmailByUserInfo(dto: findEmailRequestDto) {
    return pipe(
      await this.userRepository.findOne({ where: { name: dto.name } }),
      throwIf(
        isNil,
        () =>
          new HttpException('존재하지 않는 유저 입니다.', HttpStatus.NOT_FOUND),
      ),
      (user) => user.email,
    );
  }

  async generatePasswordToken(dto: FindPasswordRequestDto) {
    return this.jwtService.sign(dto, { secret: process.env.PASSWORD_SECRET });
  }

  async sendEmailWithPasswordToken(email: string) {
    return;
  }

  async getUpdatePassword(query: string) {
    // query 복호화해서 정상적인 토큰이면 (email이랑 비교해봐서 일치하면) true, 아니면 에러
    return Promise.resolve(undefined);
  }

  async validateUser(dto: UserValidateDto) {
    return pipe(
      await this.userService.findUserByEmail(dto.email),
      tap(async (user) =>
        pipe(
          await bcrypt.compare(dto.password, user.password),
          throwIf(
            (data) => !data,
            () =>
              new HttpException(
                '비밀번호가 일치하지 않습니다.',
                HttpStatus.UNAUTHORIZED,
              ),
          ),
        ),
      ),
    );
  }
}
