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
  orderNumber: any;
  creationDate: any;
  type: any;
  createdBy: string;
  sOrg: any;
  sOff: any;
  totalValue: any;
  item: number;
  netValue: any;
  referenced: boolean;
  soldTo: number;
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
    // const wait = (ms) => new Promise(res => setTimeout(res, ms));

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9210")); 
    }).sum((row) => {
      return row('netValue').coerceTo('NUMBER');
    }).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got total value sales orders this month.');
      r.db('salesDASH').table('dash').insert([{ field: 'salesOrdersTotalValueCurrentMonth', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {  
        this.logger.log('total Sales orders this month updated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    })

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050")); 
    }).sum((row) => {
      return row('netValue').coerceTo('NUMBER');
    }).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got total value quotations this month.');
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsTotalValueCurrentMonth', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('total Sales orders this month updated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').year().eq(r.now().year()), row('type').eq("9210")); 
    }).sum((row) => {
      return row('netValue').coerceTo('NUMBER');
    }).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got total value sales orders this year.');
      r.db('salesDASH').table('dash').insert([{ field: 'salesOrdersTotalValueCurrentYear', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('total Sales orders this year updated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').year().eq(r.now().year()), row('type').eq("9050")); 
    }).sum((row) => {
      return row('netValue').coerceTo('NUMBER');
    }).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got total value quotations this year.');
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsTotalValueCurrentYear', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('total quotations this year updated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050"), row('referenced').eq(true)); 
    }).count().div(r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050")); 
    }).count()).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got hit rate percentage this month.');        
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsHitRateCurrentMonth', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Hit rate of current month udpated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050"), row('referenced').eq(true)); 
    }).count().div(r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050")); 
    }).count()).run(this.rethinkDB).then((result) => {        
      this.logger.log('Got hit rate percentage this year.');
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsHitRateCurrentYear', value: math.format(result, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then(async (result) => {
        this.logger.log('Hit rate of current year udpated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    this.logger.log('Updating dash -- last five sales orders.' );
    r.do(
      r.db('salesDASH').table('salesOrders').orderBy({index: r.desc('orderNumber')}).distinct({index: 'orderNumber'}).limit(5).coerceTo('array'),
        function(lastFive) {
          return r.db('salesDASH').table('salesOrders').getAll(r.args(lastFive), {index: 'orderNumber'});
        }
    ).run(this.rethinkDB).then((cursor) => {
        return cursor.toArray();
    }).then((lastFive) => {
      return lastFive.filter(this.reduceArray('orderNumber'));      
    }).then((filteredLastFive) => {
      r.db('salesDASH').table('dash').insert([{ field: 'lastFiveSalesOrders', value: filteredLastFive }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Last five sales orders updated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });
    
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
                        row.orderNumber = parseInt(currentCell, 10);
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
                    } else if (header[y] === 'soldTo') {
                        row.soldTo = parseInt(currentCell, 10);
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

                row.creationDate = r.time(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), '+01:00');
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