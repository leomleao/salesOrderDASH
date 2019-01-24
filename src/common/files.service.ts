import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from './logging.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly logger: LoggerService = new LoggerService(FilesService.name);

  async findNewFiles(folderPath) {
    if (!fs.existsSync(folderPath)) {
      this.logger.error('No dir!', new Error().stack);
      return;
    }
    const foundFiles = [];
    const files = fs.readdirSync(folderPath);
    this.logger.log('Reading folder -- ' + folderPath);

    for (const file of files) {
      const filename = path.join(folderPath, file);
      const extension = path.extname(filename);

      if (
        filename.indexOf('TREATED') < 0 &&
        filename.indexOf('Job BR_DB') >= 0
      ) {
        this.logger.log('Found -- ' + filename);
        const type = filename.substring(
          filename.indexOf('Job BR_DB') + 10,
          filename.indexOf(','),
        );
        const newFileName = filename.replace(
          filename.substring(
            filename.indexOf('Job BR_DB') + 10,
            filename.indexOf(','),
          ),
          type + 'TREATED',
        );
        fs.renameSync(filename, newFileName);
        foundFiles.push({ type, extension, path: newFileName });
      }
    }

    return foundFiles;
  }
}
