import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';
import { successResponse } from './common/types/api-response.type';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return successResponse({ status: 'ok', timestamp: new Date().toISOString() });
  }
}
