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

  @Interval(5000)
  async findNewF123123iles() {
    //  await this.salesOrderService.updateDash();
    //  await this.salesOrderService.getTotals();
     this.invoiceService.updateDash();
    //  this.invoiceService.updateInvoiceTotals();
     this.invoiceService.updateInvoiceNegativeValues();
  }

  // @Interval(10000)
  async findNewFiles() {
    this.logger.log('Finding new files!');
    await this.fileService
      .findNewFiles(this.config.get('common.folderPROCESSING'))
      .then(async foundFiles => {
        if (foundFiles !== undefined || foundFiles.length !== 0) {
          for (let i = foundFiles.length - 1; i >= 0; i--) {
            if (foundFiles[i].type === 'CUSTOMERDATA') {
              this.logger.log('Treating data of customers!');
              this.customerService
                .updateData(foundFiles[i].path, foundFiles[i].extension)
                .then(() => {
                  this.customerService.updateDash();
                });
            } else if (foundFiles[i].type === 'NFEDATA') {
              this.logger.log('Treating data of invoices!');
              this.invoiceService
                .updateData(foundFiles[i].path, foundFiles[i].extension)
                .then(() => {
                  this.invoiceService.updateInvoiceTotals().then(() => {
                    // this.invoiceService.updateDash();
                  });
                });
            } else if (foundFiles[i].type === 'SALESORDERDATA') {
              this.logger.log('Treating data of sales orders!');
              this.salesOrderService
                .updateData(foundFiles[i].path, foundFiles[i].extension)
                .then(() => {
                  this.salesOrderService.updateLocationSalesOrders();
                  // this.salesOrderService.updateDash();
                  // this.salesOrderService.getTotals();
                });
            } else if (foundFiles[i].type === 'DB2') {
              this.logger.log('Treating data of db2 analysis!');
              this.customerService
                .updateDB2(foundFiles[i].path, foundFiles[i].extension)
                .then(() => {
                  // this.salesOrderService.updateDash();
                });
            }
          }
        }
      });
  }
}
