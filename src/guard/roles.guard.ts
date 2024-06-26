import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/common/roles/roles.decorator';
import { AuthorizationStatusType } from 'src/entity/common/Enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get(Roles, context.getHandler());

    if (role === 'anyone') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (role === 'login') {
      if (user) {
        return true;
      }
    }

    if (!user || user.authorizationStatus !== AuthorizationStatusType.ACCEPT) {
      throw new UnauthorizedException('인증되지 않은 사용자 입니다.');
    }

    return true;
  }
}
