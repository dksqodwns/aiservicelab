import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entity/user.entity';
import { isNil, pipe, throwIf } from '@fxts/core';
import { findEmailRequestDto } from '../dto/request/find-email.request.dto';

@Injectable()
export class UsersService {
  @InjectRepository(User) private readonly userRepository: Repository<User>;

  async findUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(id: number): Promise<User> {
    return pipe(
      await this.userRepository.findOne({ where: { id } }),
      throwIf(
        isNil,
        () =>
          new HttpException('존재하지 않는 유저 입니다.', HttpStatus.NOT_FOUND),
      ),
    );
  }

  async findUserByEmail(email: string): Promise<User> {
    return pipe(
      await this.userRepository.findOne({ where: { email } }),
      throwIf(
        isNil,
        () =>
          new HttpException('존재하지 않는 유저 입니다.', HttpStatus.NOT_FOUND),
      ),
    );
  }
}
