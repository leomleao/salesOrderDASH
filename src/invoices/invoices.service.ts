import { Inject, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as soap from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import * as math from 'mathjs';

import { LoggerService } from '../common/logging.service';
import { InjectConfig  } from 'nestjs-config';

math.config({
  number: 'BigNumber', // Default type of number:
  // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 20, // Number of significant digits for BigNumbers
});

interface InvoiceItem {
  docNumber: any;
  totalTax: any;
  postDate: any;
  totalValue: any;
  partnerID: any;
  dirMovement: any;
  cancelDate: any;
}

@Injectable()
export class InvoicesService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService(InvoicesService.name);
  constructor(
    @Inject('rethinkDB') private readonly rethinkDB,
    @InjectConfig() private readonly config,
  ) { }

  onModuleInit() {
    // console.log(`Initialization...`);
    // r.table('dash').changes().run(this.rethinkDB, function(err, cursor) {
    //     if (err) throw err;
    //     this.InvoicesServices.updateInvoiceTotals();
    // });
  }

  async updateDash() {
    // const data = [];
    // r.db('salesDASH').table('invoices').count().run(this.rethinkDB)
    // .then((result) => {
    //   const totalCustomers = result;
    //   // console.info('total customer --- ', totalCustomers);
    //   r.db('salesDASH').table('customers').filter((row) => {
    //     return row('Date').gt(r.now().sub(60 * 60 * 24 * 31)); // only include records from the last 31 days
    //   }).orderBy(r.desc('Date')).run(this.rethinkDB)
    //   .then((result) => {
    //     // console.info('total new customer --- ', result.length);
    //     data.push({ field: 'newCustomers', value: result.length });
    //     r.db('salesDASH').table('dash').insert(data, {conflict: 'update'}).run(this.rethinkDB)
    //     .then((result) => {
    //       // console.info(JSON.stringify(result, null, 2));
    //     });
    //   });
    // }).catch((err) => {
    //   // console.info(JSON.stringify(err, null, 2));
    // });
  }

  async updateInvoiceTotals() {

    r.db('salesDASH').table('invoices').group([r.row('postDate').month(), r.row('postDate').year()]).sum((invoice) => {
      return r.branch(invoice('dirMovement').eq("1"), invoice('totalValue').coerceTo('NUMBER').mul(-1), invoice('totalValue').coerceTo('NUMBER'));
    }).run(this.rethinkDB).then((result) => {
      const data = [];
      for (let i = result.length - 1; i >= 0; i--) {
        data.push({ period: result[i].group[0] + '.' + result[i].group[1], value: result[i].reduction});
      }
      return data;
    }).then((totals) => {
      r.db('salesDASH').table('invoiceTotals').insert(totals, {conflict: 'update'}).run(this.rethinkDB).then((result) => {
        this.logger.log("Invoice totals updated on dash.");
      });
    }).catch((err) => {
      this.logger.error(err, err.stack());
    });
  }

  async updateData(path: string, type: string) {
    // console.log('gotcha ya');
    const $ = cheerio.load(fs.readFileSync(path));

    // get header
    const header = [];
    const data = [];
    try {
      if (type === '.htm') {
        $('tbody').first().children().find('nobr').each( function(i, elem) {
          const columnHeader = $(this).text().replace(/^\s+|\s+$/g, '');
          if (columnHeader === 'Material') {
            header.push('Material');
            header.push('ID');
          } else {
            header.push(columnHeader);
          }
        });

        header.push('totalTax');

        $('tbody').each( function(i, tbodyElem) {
          $(this).next().find('tr').each( function(j, trElem) {
            let row : InvoiceItem = <InvoiceItem>{};
            row.totalTax = 0;

            $(this).find('nobr').each( function(y, nobrElem) {
            // console.info($(this).children().children().text());
              const currentCell = $(this).text().replace(/^\s+|\s+$/g, '');

              if (header[y].indexOf('Doc. No.') >= 0){
                row.docNumber = parseInt(currentCell, 10);
              } else if (header[y].indexOf('Post.date') >= 0) {
                const [day, month, year] = currentCell.split('.');
                row.postDate = r.time(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), '-03:00');
              } else if (header[y].indexOf('Taxva') >= 0){
                row.totalTax = math.format(math.add(math.bignumber(row.totalTax), math.bignumber(currentCell.replace(/\./g, '').replace(/\,/g, '.'))));
              } else if (header[y].indexOf('Total NF') >= 0) {
                row.totalValue = currentCell.replace(/\./g, '').replace(/\,/g, '.');
              } else if (header[y].indexOf('Partner') >= 0) {
                row.partnerID = currentCell;
              } else if (header[y].indexOf('Dir.movem.') >= 0) {
                row.dirMovement = currentCell;
              } else if (header[y].indexOf('Canc. Date') >= 0 && currentCell !== '') {
                row.cancelDate = currentCell;
              } else if (currentCell !== '') {
                row[header[y]] = currentCell;
              }
            });           

            data.push(row);
          });
        });
      } else if (type === '.HTM') {
          // $('tbody').first().find('tr').find('td').each( function(i, elem) {
          //   header.push($(this).text().replace(/^\s+|\s+$/g, ''));
          // });

          // $('tbody').first().find('tr').each( function(i, elem) {

          //   let row = {};
          //   if (i != 0) {
          //     $(this).find('td').each( function(i, elem) {
          //     // console.info($(this).children().children().text());
          //       if (header[i] == "Customer"){
          //         row[header[i]] = parseInt($(this).text().replace(/^\s+|\s+$/g, ''));
          //       } if (header[i] == "Date"){
          //         const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split(".");
          //         row[header[i]] = new Date(year, month - 1, day);
          //       } else {
          //         row[header[i]] = $(this).text().replace(/^\s+|\s+$/g, '');
          //       }
          //     })
          //     data.push(row);
          //   }
          // });
      }      

    } catch (err) {
      this.logger.error(err, err.stack);
    }

    this.logger.log("Invoice data treated.");
    // console.info(JSON.stringify(data));
    return this.groupBy(data, this.demoComparator, this.demoOnDublicate).then(async (groupedInvoices) => {
      return await r.db('salesDASH').table('invoices').insert(groupedInvoices, {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log("Data uploaded to DB.");
        fs.unlink(path, (err) => {
          if (err) throw err;
          this.logger.warn("Treated file deleted: " + path);
        });
        // console.log('file would have been deleted now');
      }).catch((err) => {
        this.logger.error(err, err.stack());
      });
    });

    // console.info(JSON.stringify(invoices))
    // return await r.db('salesDASH').table('customers').insert(invoices, {conflict: "update"}).run(this.rethinkDB)
    //   .then((result) => {
    //     console.info(JSON.stringify(result, null, 2));
    //     // fs.unlink(path, (err) => {
    //     //   if (err) throw err;
    //     //   console.info("file deleted");
    //     // });
    //     console.log("file would have been deleted now");
    //   }).catch(function(err) {
    //     console.info(JSON.stringify(err, null, 2));
    //   });

  }

  private demoComparator = (v1: any, v2: any) => {
    return v1.docNumber === v2.docNumber;
  }

  private demoOnDublicate = (uniqueRow, dublicateRow) => {
    uniqueRow.totalTax = math.format(math.add(math.bignumber(uniqueRow.totalTax), math.bignumber(dublicateRow.totalTax)));
  }

  private async groupBy(data: any[], comparator: (v1: any, v2: any) => boolean, onDublicate: (uniqueRow: any, dublicateRow: any) => void) {
    return data.reduce((reducedRows, currentlyReducedRow) => {
      const processedRow = reducedRows.find(searchedRow => comparator(searchedRow, currentlyReducedRow));
      if (processedRow) {
        // currentlyReducedRow is a dublicateRow when processedRow is not null.
        // processedRow.totalValue = processedRow.totalValue.minus(currentlyReducedRow.taxValue);
        // processedRow.totalValue = processedRow.totalValue.minus(currentlyReducedRow.taxValue);
        processedRow.totalValue = math.format(math.subtract(math.bignumber(processedRow.totalValue), math.bignumber(currentlyReducedRow.totalTax)));
        onDublicate(processedRow, currentlyReducedRow);
      } else {
        // currentlyReducedRow is unique and must be pushed in the reducedRows collection.
        // currentlyReducedRow.totalValue = currentlyReducedRow.totalValue.minus(currentlyReducedRow.taxValue);
        currentlyReducedRow.totalValue = math.format(math.subtract(math.bignumber(currentlyReducedRow.totalValue), math.bignumber(currentlyReducedRow.totalTax)));

        reducedRows.push(currentlyReducedRow);
      }
      return reducedRows;
    }, []);
  }

}