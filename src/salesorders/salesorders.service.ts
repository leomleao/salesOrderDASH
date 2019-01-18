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

interface SalesOrderItem {
  docNumber: any;
  creationDate: any;
  type: any;
  createdBy: string;
  sOrg: any;
  sOff: any;
  totalValue: any;
  item: number;
  netValue: any;
  referenced: boolean;
}

@Injectable()
export class SalesOrdersService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService(SalesOrdersService.name);
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
      const today = new Date();

      // const yearlyTotal = 

      // const monthlyTotal = 

      // const weeklyTotal = 

      // const hitRateWeekly =  



    // console.info(data.filter(this.reduceArray('docNumber')).length);
    // const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // this.logger.log('Updating dash -- total sales.' );
    // r.db('salesDASH').table('invoiceTotals').run(this.rethinkDB).then((cursor) => {
    //     return cursor.toArray();
    // }).then((invoiceTotals) => {
    //     // process the results
    //   const data = [];
    //   const year = new Date().getFullYear();

    //   for (let i = 0; i <= 11; i++) {
    //     const current: GraphColumn = {} as GraphColumn;
    //     let test;
    //     current.month = months[i];
    //     current.sales = (typeof (test = invoiceTotals.find((sales) => sales.period ===  ( i + 1 )  + '.' + year)) === 'object') ? test.value : 0;
    //     current.salesPast = (typeof (test = invoiceTotals.find((sales) => sales.period ===  ( i + 1 ) + '.' + (year - 1))) === 'object') ? test.value : 0;
    //     current.meta = (current.salesPast > 0) ? current.salesPast * 1.1 : 0;
    //     data.push(current);
    //   }

    //   r.db('salesDASH').table('dash').insert([{ field: 'chartData', value: data }], {conflict: 'update'}).run(this.rethinkDB)
    //   .then((result) => {
    //     this.logger.log('Sales graph data updated.');
    //   });
    // }).catch((err) => {
    //   this.logger.error(err, err.stack);
    // });

    // this.logger.log('Updating dash -- last five.' );
    // r.db('salesDASH').table('invoices').orderBy(r.desc('postDate')).limit(5).run(this.rethinkDB).then((cursor) => {
    //     return cursor.toArray();
    // }).then((lastFive) => {
    //   r.db('salesDASH').table('dash').insert([{ field: 'lastFive', value: lastFive }], {conflict: 'update'}).run(this.rethinkDB)
    //   .then((result) => {
    //     this.logger.log('Sales graph data updated.');
    //   });
    // }).catch((err) => {
    //   this.logger.error(err, err.stack);
    // });

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
    // return Promise.all([yearlyTotal, monthlyTotal, weeklyTotal, hitRateWeekly])
    // .then(function(res){
    //     console.log('Promise.all', res);        
    // })
    // .catch(function(err){
    //     console.error('err', err);
    // });
  } 

    async updateData(path: string, type: string) {
        this.logger.log("Gotcha ya!");
        const $ = cheerio.load(fs.readFileSync(path));

        // get header
        const header = [];
        const data = [];
        try {
          if (type === '.htm') {
            $('tbody').first().children().find('nobr').each( function(i, elem) {
              const columnHeader = $(this).text().replace(/^\s+|\s+$/g, '');          
                header.push(columnHeader);
            });

            $('tbody').each( function(i, tbodyElem) {
              $(this).next().find('tr').each( function(j, trElem) {
                const row: SalesOrderItem = {} as SalesOrderItem;
                let day, month, year, hour, minute, second;

                $(this).find('nobr').each( function(y, nobrElem) {
                // console.info($(this).children().children().text());
                    const currentCell = $(this).text().replace(/^\s+|\s+$/g, '')

                    if (header[y] === "docNumber"){
                        row.docNumber = [parseInt(currentCell, 10)];
                    } else if (header[y] === "creationDate") {
                        [day, month, year] = currentCell.split('.');
                    } else if (header[y] === "time") {
                        [hour, minute, second] = currentCell.split(':');
                    } else if (header[y] === 'type') {
                        row.type = currentCell;
                    } else if (header[y] === 'createdBy') {
                        row.createdBy = currentCell;
                    } else if (header[y] === 'sOrg') {
                        row.sOrg = currentCell;
                    } else if (header[y] === 'sOff') {
                        row.sOff = currentCell;
                    } else if (header[y] === 'item') {
                        row.docNumber.push(parseInt(currentCell, 10));
                    } else if (header[y] === 'netValue') {                      
                        row.netValue = currentCell.replace(/\./g, '').replace(/\,/g, '.');
                    } else if (header[y] === 'totalValue') {
                        row.totalValue = currentCell.replace(/\./g, '').replace(/\,/g, '.');
                    } else if (header[y] === 'followDoc') {
                        (currentCell !== '') ? row.referenced = true : row.referenced = false;                
                    } else if (currentCell !== '') {
                      row[header[y]] = currentCell;
                    }

                });

                row.creationDate = r.time(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), '-03:00');
                data.push(row);

              });
              console.info(data);

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

        this.logger.log('Sales orders data treated.');
        // console.info(JSON.stringify(data));
        return await r.db('salesDASH').table('salesOrders').insert(data, {conflict: 'update'}).run(this.rethinkDB)
        .then((result) => {
            this.logger.log('Data uploaded to DB.');
            fs.unlink(path, (err) => {
              if (err) throw err;
              this.logger.warn('Treated file deleted: ' + path);
            });
        }).catch((err) => {
            this.logger.error(err, err.stack);
        });        
    }    

    private reduceArray(prop) {    
        return (ele, i, arr) => arr.map(ele => ele[prop]).indexOf(ele[prop]) === i;    
    }

}