import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../domain/entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.usersService.findUsers();
  }

  @Get('/:id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.usersService.findUserById(id);
  }
}
