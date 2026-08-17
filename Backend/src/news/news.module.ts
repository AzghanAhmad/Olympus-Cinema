import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController, NewsAdminController } from './news.controller';

@Module({
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
