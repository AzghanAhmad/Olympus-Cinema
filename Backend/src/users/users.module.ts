import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, UsersAdminController } from './users.controller';

@Module({
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
