import { Controller, Get, Inject, Logger, LoggerService } from '@nestjs/common';
import { AppService } from '../service/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(Logger) private readonly logger: LoggerService,
  ) { }

  @Get()
  getHello(): any {
    // return this.appService.getHello();
    this.logger.log('Hello??');
    return { result: 123 };
  }
}
