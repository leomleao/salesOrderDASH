import * as winston from 'winston';
import * as chalk from 'chalk';
import * as PrettyError from 'pretty-error';
// import { Logger as LoggerInstance, LoggerOptions } from 'winston';
import { Logger } from '@nestjs/common';

// tslint:disable:no-console

export class LoggerService extends Logger {
  // private readonly logger: LoggerInstance;
  private readonly prettyError = new PrettyError();
  // public static loggerOptions: LoggerOptions = {
  //   transports: [
  //     new winston.transports.File({
  //       filename: __dirname + '../../debug.log',
  //     }),
  //   ],
  // };
  constructor(context){
    super(context);
    this.prettyError.skipNodeFiles();
    this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  }

  // constructor(private context: string, transport?) {
  //   this.logger = (winston as any).createLogger(LoggerService.loggerOptions);
  //   this.prettyError.skipNodeFiles();
  //   this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  // }

  // static configGlobal(options?: LoggerOptions) {
  //   this.loggerOptions = options;
  // }

  // printStackTrace(trace: string) {
  //   // add your custom business logic
  //   this.prettyError.render(trace, true);
  //   super.printStackTrace(trace);
  // }

  error(message: string, trace: any) {
    if (trace) {
      super.error(message);
      this.prettyError.render(trace, true);
    } else {
      super.error(message, trace);
    }
    // add your custom business logic
    // console.info();
  }

  // log(message: string): void {
  //   const currentDate = new Date();
  //   this.logger.info(message, {
  //     timestamp: currentDate.toISOString(),
  //     context: this.context,
  //   });
  //   this.printToConsole('info', message);
  // }

  // error(message: string, trace?: any): void {
  //   const currentDate = new Date();
  //   // i think the trace should be JSON Stringified
  //   this.logger.error(`${message} -> (${trace || 'trace not provided !'})`, {
  //     timestamp: currentDate.toISOString(),
  //     context: this.context,
  //   });
  //   this.printToConsole('error', message, trace);
  // }

  // warn(message: string): void {
  //   const currentDate = new Date();
  //   this.logger.warn(message, {
  //     timestamp: currentDate.toISOString(),
  //     context: this.context,
  //   });
  //   this.printToConsole('warn', message);
  // }

  // overrideOptions(options: LoggerOptions) {
  //   this.logger.configure(options);
  // }

  // this method just for printing a cool log in your terminal , using chalk
  // private printToConsole(level: string, message: string, error?): void {
  //   let result = '';
  //   const color = chalk.default;
  //   const currentDate = new Date();
  //   const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

  //   switch (level) {
  //     case 'info':
  //       result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
  //         this.context,
  //       )}] ${message}`;
  //       break;
  //     case 'error':
  //       result = `[${color.red('ERR')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
  //         this.context,
  //       )}] ${message}`;
  //       if (error) this.prettyError.render(error, true);
  //       break;
  //     case 'warn':
  //       result = `[${color.yellow('WARN')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
  //         this.context,
  //       )}] ${message}`;
  //       break;
  //     default:
  //       break;
  //   }
  //   console.log(result);
  // }
}