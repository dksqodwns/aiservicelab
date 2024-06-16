import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JoinRequestDto } from './dto/request/join.request.dto';
import { Response } from 'express';
import { findEmailRequestDto } from './dto/request/find-email.request.dto';
import { FindPasswordRequestDto } from './dto/request/find-password.request.dto';
import { pipe, throwIf } from '@fxts/core';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { UpdatePasswordDto } from './dto/request/update-password.dto';

@Controller()
export class AppController {
  constructor(
    private readonly service: AppService,
    @Inject('BaseUrl') private readonly BaseUrl: string,
  ) {}

  @Post('/login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequestDto,
  ) {
    const { accessToken, refreshToken } = await this.service.login(dto);
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);

    res.redirect(`${this.BaseUrl}`);
  }

  @Post('/join')
  async join(@Body() dto: JoinRequestDto) {
    return await this.service.join(dto);
  }

  @Post('/id')
  async findEmailByUserInfo(@Body() dto: findEmailRequestDto) {
    return await this.service.findEmailByUserInfo(dto);
  }

  @Post('/password')
  async findPasswordByEmail(
    @Body() dto: FindPasswordRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const passwordToken = await this.service.generatePasswordToken(dto.email);
    return pipe(await this.service.sendEmailWithPasswordToken(dto), () =>
      res.redirect(`${this.BaseUrl}/password?passwordToken=${passwordToken}`),
    );
  }

  @Get('/password')
  async getUpdatePassword(
    @Res({ passthrough: true }) res: Response,
    @Query('passwordToken') query: string,
  ) {
    return pipe(
      await this.service.getUpdatePassword(query),
      throwIf(
        (token) => !token,
        () =>
          new HttpException(
            '유효하지 않은 토큰 입니다.',
            HttpStatus.UNAUTHORIZED,
          ),
      ),
      () => res.redirect(`${this.BaseUrl}/updatePassword`),
    );
  }

  @Patch('/password')
  async updatePassword(dto: UpdatePasswordDto) {
    return await this.service.updatePassword(dto);
  }
}
