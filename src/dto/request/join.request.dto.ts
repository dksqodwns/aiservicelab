import { IsNotEmpty, IsString } from 'class-validator';

export class JoinRequestDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  birthday: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
