import { Injectable, Inject } from "@nestjs/common";
import { Interval, NestSchedule } from "nest-schedule";
import { CustomersService } from "../customers/customers.service";
import { InvoicesService } from "../invoices/invoices.service";
import { FileService } from "./file.service";
import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class ScheduleService extends NestSchedule {
  public constructor(
    @Inject(CustomersService) private readonly CustomersService: CustomersService,
    @Inject(FileService) private readonly FileService: FileService,
    @Inject(InvoicesService) private readonly InvoicesService: InvoicesService,
    @InjectConfig() private readonly config
  ) {
    super();
  }

  @Interval(5000)
  async findNewF123123iles() {
    await this.InvoicesService.groupInvoices();
  }

  // @Interval(10000)
  async findNewFiles() {
    let type = '.htm';
    await this.FileService.findNewFiles(this.config.get('common.folderPROCESSING'), type)
    .then( async(foundFiles) => {

      if (Array.isArray(foundFiles) && foundFiles.length == 0) {
        type = '.HTM';
        foundFiles = await this.FileService.findNewFiles(this.config.get('common.folderPROCESSING'), type)
      } 

      if (foundFiles !== undefined || foundFiles.length != 0) {
        console.info("-----____--__--_--");
        console.info(foundFiles);
        console.info("-----____--__--_--");

        for (var i = foundFiles.length - 1; i >= 0; i--) {
          if (foundFiles[i].type == "CUSTOMERDATA") {
            console.log('started data update for ', foundFiles[i].path);
            this.CustomersService.updateData(foundFiles[i].path, type)
            .then(() =>{
              this.CustomersService.updateDash();
            });
          } else if (foundFiles[i].type == "NFEDATA") {
            console.log('started data update for ', foundFiles[i].path);
            this.InvoicesService.updateData(foundFiles[i].path, type)
            .then(() =>{
              this.InvoicesService.updateDash();
            });
          }
        }
      } 
    });
  }

}