import { Inject, Injectable, Logger, LoggerService, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerContextMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: LoggerService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl, headers } = req;

    const originalSend = res.send;
    const that = this;

    //@ts-ignore
    res.send = function (body: any) {
      if (typeof body === 'string') {
        that.logger.log(`Response Body: ${body}`);
      }
      originalSend.apply(res, arguments);
    };

    res.on('finish', () => {
      const { statusCode } = res;
      this.logger.log(`${ip} ${method} ${originalUrl} ${statusCode}`);
      if (Object.keys(req.body).length !== 0) {
        this.logger.log(`Request body: ${JSON.stringify(req.body)}`);
      }
    });
    next();
  }
}