import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './domain/entity';
import { Repository } from 'typeorm';
import { isNil, pipe, throwIf } from '@fxts/core';
import {
  findEmailRequestDto,
  FindPasswordRequestDto,
  JoinRequestDto,
} from './dto/request';
import * as bcrypt from 'bcrypt';
import {
  GenerateAccessTokenDto,
  GenerateRefreshTokenDto,
} from './dto/auth/generate.token.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { LoginResponseDto } from './dto/response/login.response.dto';
import { UpdatePasswordDto } from './dto/request/update-password.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  @InjectRepository(User) private readonly userRepository: Repository<User>;

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    return pipe(
      await this.userService.findUserByEmail(dto.email),
      async (user) => await bcrypt.compare(dto.password, user.password),
      throwIf(
        (data) => !data,
        () =>
          new HttpException(
            '비밀번호가 일치하지 않습니다.',
            HttpStatus.UNAUTHORIZED,
          ),
      ),
      async () =>
        await Promise.all([
          this.generateAccessToken(dto),
          this.generateRefreshToken(dto),
        ]),
      ([accessToken, refreshToken]) => ({
        accessToken,
        refreshToken,
      }),
    );
  }

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

  async generatePasswordToken(email: string) {
    return this.jwtService.sign(email, { secret: process.env.PASSWORD_SECRET });
  }

  async sendEmailWithPasswordToken(dto: FindPasswordRequestDto) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (user.name !== dto.name || user.phone !== dto.phone) {
      throw new HttpException(
        '입력하신 정보와 일치하지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const passwordToken = await this.generatePasswordToken(dto.email);

    // TODO: 모듈화해서 밖으로 빼는게 좋을듯
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP,
      port: +process.env.SMTP_PORT,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: dto.email,
      subject: '[패스워드 변경 링크] AI Service LAB 비밀번호 변경 링크 입니다.',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>비밀번호 변경 링크</h2>
          <p>안녕하세요,</p>
          <p>아래의 링크를 클릭하여 비밀번호를 변경하세요:</p>
          <a 
            href="http://localhost:3000/api/password?passwordToken=${passwordToken}" 
            style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
          >
            비밀번호 변경
          </a>
          <p>감사합니다,<br/>AI Service LAB</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`send email: ${dto.email}`);
        console.log(`send info: ${info}`);
      }
    });
  }

  //TODO: 복호화가 안되니까 복호화가 되는 crypt를 사용하거나, 하여튼 암호화 로직을 변경해야 할 듯
  async getUpdatePassword(query: string) {
    // query 복호화해서 정상적인 토큰이면 (email이랑 비교해봐서 일치하면) true, 아니면 에러
    return pipe(
      this.jwtService.verify(query, {
        secret: process.env.PASSWORD_SECRET,
      }),
      async (email) => await this.userService.findUserByEmail(email),
      () => true,
    );
  }

  async updatePassword(dto: UpdatePasswordDto) {
    if (dto.password !== dto.checkPassword) {
      throw new HttpException(
        '비밀번호가 서로 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return pipe(
      await this.userService.findUserByEmail(dto.email),
      async (user) =>
        await this.userRepository.update(
          { email: user.email },
          { password: await bcrypt.hash(dto.password, 10) },
        ),
    );
  }
}
