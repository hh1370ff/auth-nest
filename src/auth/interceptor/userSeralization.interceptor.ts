import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/user/user.entity';

@Injectable()
export class UserSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        console.log(data);
        if (data instanceof User) {
          // Serialize the User entity, excluding fields marked with @Exclude()

          return instanceToPlain(data);
        }
        return data;
      }),
    );
  }
}
