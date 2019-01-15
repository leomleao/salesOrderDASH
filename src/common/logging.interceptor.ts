import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// tslint:disable:no-console

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        call$: Observable<any>,
    ): Observable<any> {
        console.log('Before...');

        const now = Date.now();
        return call$.pipe(
            tap(() => {
                const args = context.getArgs();
                if (args && args.length && args[0]) {
                    const im: IncomingMessage = args[0];
                    const url = im.url;
                    const method = im.method;
                    const status = im.statusCode; // not correct --> something for later
                    console.log(method, url, status, ` ${Date.now() - now}ms`);
                } else {
                    console.log(` ${Date.now() - now}ms`);
                }
            }),
        );
    }
}
