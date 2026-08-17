import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController, MoviesAdminController } from './movies.controller';

@Module({
  controllers: [MoviesController, MoviesAdminController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
