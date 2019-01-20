import { Injectable, Inject } from '@nestjs/common';
import { Interval, NestSchedule } from 'nest-schedule';
import { CustomersService } from '../customers/customers.service';
import { InvoicesService } from '../invoices/invoices.service';
import { SalesOrdersService } from '../salesorders/salesorders.service';
import { FilesService } from './files.service';
import { LoggerService } from './logging.service';
import { InjectConfig } from 'nestjs-config';

@Injectable()
export class ScheduleService extends NestSchedule {
  private readonly logger: LoggerService = new LoggerService(
    ScheduleService.name,
  );
  public constructor(
    @Inject(CustomersService)
    private readonly customerService: CustomersService,
    @Inject(FilesService) private readonly fileService: FilesService,
    @Inject(InvoicesService) private readonly invoiceService: InvoicesService,
    @Inject(SalesOrdersService)
    private readonly salesOrderService: SalesOrdersService,
    @InjectConfig() private readonly config,
  ) {
    super();
  }

  // @Interval(5000)
  async findNewF123123iles() {
    await this.invoiceService.updateDash();
  }

  @Interval(10000)
  async findNewFiles() {
    this.logger.log('Finding new files!');
    let type = '.htm';
    await this.fileService
      .findNewFiles(this.config.get('common.folderPROCESSING'), type)
      .then(async foundFiles => {
        if (Array.isArray(foundFiles) && foundFiles.length === 0) {
          type = '.HTM';
          foundFiles = await this.fileService.findNewFiles(
            this.config.get('common.folderPROCESSING'),
            type,
          );
        }

        if (foundFiles !== undefined || foundFiles.length !== 0) {
          for (let i = foundFiles.length - 1; i >= 0; i--) {
            if (foundFiles[i].type === 'CUSTOMERDATA') {
              this.logger.log('Treating data of customers!');
              this.customerService
                .updateData(foundFiles[i].path, type)
                .then(() => {
                  this.customerService.updateDash();
                });
            } else if (foundFiles[i].type === 'NFEDATA') {
              this.logger.log('Treating data of invoices!');
              this.invoiceService
                .updateData(foundFiles[i].path, type)
                .then(() => {
                  this.invoiceService.updateInvoiceTotals().then(() => {
                    // this.invoiceService.updateDash();
                  });
                });
            } else if (foundFiles[i].type === 'SALESORDERDATA') {
              this.logger.log('Treating data of sales orders!');
              this.salesOrderService
                .updateData(foundFiles[i].path, type)
                .then(() => {
                  // this.salesOrderService.updateDash();
                });
            }
          }
        }
      });
  }
}
