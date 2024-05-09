import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeORMConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      autoLoadEntities: true,
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST'),
      port: +(this.configService.get<number>('DB_PORT') || 3306),
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      entities: ['dist/**/*.entity.js'],
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
      logging: true,
      timezone: '+09:00',
    };
  }
}