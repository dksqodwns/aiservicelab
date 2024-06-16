import {
  Body,
  Controller,
  Get,
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
import { pipe } from '@fxts/core';
import { LoginRequestDto } from './dto/request/login.request.dto';

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
    // 이메일을 보내자
    const passwordToken = await this.service.generatePasswordToken(dto);
    return pipe(await this.service.sendEmailWithPasswordToken(dto.email), () =>
      res.redirect(`${this.BaseUrl}/password?passwordToken=${passwordToken}`),
    );
  }

  @Get('/password')
  async getUpdatePassword(@Query('passwordToken') query: string) {
    return await this.service.getUpdatePassword(query);
  }

  @Patch('/password')
  async updatePassword() {} // bcrypt 사용해서 암호화 된 패스워드 업데이트
}
