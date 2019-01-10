import { Injectable, Inject } from "@nestjs/common";
import { Interval, NestSchedule } from "nest-schedule";
import { SalesOrdersService } from "../salesorders/salesorders.service";
import { FileService } from "./file.service";
import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class ScheduleService extends NestSchedule {
  public constructor(
    @Inject(SalesOrdersService) private readonly SalesOrdersService: SalesOrdersService,
    @Inject(FileService) private readonly FileService: FileService,
    @InjectConfig() private readonly config
  ) {
    super();
  }

  // @Interval(3000)
  // async dispatchWeeklyEmail() {
  //   await this.SalesOrdersService.updateData();
  // }

  @Interval(3000)
  async findNewFiles() {
    const foundFiles = await this.FileService.findNewFiles(this.config.get('common.folderPROCESSING'), '.htm');  

    if (foundFiles) {
      for (var i = foundFiles.length - 1; i >= 0; i--) {
        if (foundFiles[i].type == "CUSTOMERDATA") {
          console.log('started data update for ', foundFiles[i].path);
          this.SalesOrdersService.updateData(foundFiles[i].path);
        }
      }
    }
  }
}