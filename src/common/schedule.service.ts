import { Injectable, Inject } from "@nestjs/common";
import { Interval, NestSchedule } from "nest-schedule";
import { CustomersService } from "../customers/customers.service";
import { FileService } from "./file.service";
import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class ScheduleService extends NestSchedule {
  public constructor(
    @Inject(CustomersService) private readonly CustomersService: CustomersService,
    @Inject(FileService) private readonly FileService: FileService,
    @InjectConfig() private readonly config
  ) {
    super();
  }

  @Interval(1000)
  async dispatchWeeklyEmail() {
    await this.CustomersService.updateDash();
  }

  // @Interval(10000)
  // async findNewFiles() {
  //   const foundFiles = await this.FileService.findNewFiles(this.config.get('common.folderPROCESSING'), '.htm');  

  //   if (foundFiles) {
  //     for (var i = foundFiles.length - 1; i >= 0; i--) {
  //       if (foundFiles[i].type == "CUSTOMERDATA") {
  //         console.log('started data update for ', foundFiles[i].path);
  //         this.CustomersService.updateData(foundFiles[i].path);
  //       }
  //     }
  //   }
  // }

}