import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ormEntity } from './orm.entities';

export const OrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '12qwaszx!@',
  database: 'aiservicelab',
  entities: ormEntity,
  synchronize: true,
};
