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

interface SalesOrder {
  docNumber: any;
  orderNumber: any;
  creationDate: any;
  type: any;
  createdBy: string;
  sOrg: any;
  sOff: any;
  totalValue: any;  
  soldTo: number;
  items: any;
}

interface SalesOrderItem {
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

    // UPDATE THE CITY AND STATE OF ORDERS

    // r.db('salesDASH').table('salesOrders').filter(
    //     r.row.hasFields('city', 'state').not()
    // ).forEach(function (salesOrder) {
    //   return r.db('salesDASH').table('salesOrders').get(salesOrder('docNumber')).update(r.db('salesDASH').table('customers').get(salesOrder('soldTo')).pluck('city', 'state'), {'nonAtomic': true})
    // })


    // UPDATE THE CITY AND STATE OF ORDERS  


    // r.db('salesDASH').table('salesOrders').filter(
    //   r.and(r.row.hasFields('state'), r.row('type').eq("9210"))
    // ).group('state').sum((salesOrder) => {
    //   return salesOrder('totalValue').coerceTo('NUMBER');
    // }).ungroup().map(function(row){
    //   return r.object(row('group'), row('reduction'));
    // }).reduce(function(left, right) {
    //     return left.merge(right);
    // })


    //ANOTHER OPTION


    // r.db('salesDASH').table('salesOrders').filter(
    //   r.and(r.row.hasFields('state'), r.row('type').eq("9210"))
    // ).group('state').sum((salesOrder) => {
    //   return salesOrder('totalValue').coerceTo('NUMBER');
    // }).ungroup().map(function(row){
    //   return r.object('state', row('group'),'sales', row('reduction'));
    // })



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
      return row('totalValue').coerceTo('NUMBER');
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
      return row('totalValue').coerceTo('NUMBER');
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
      return row('totalValue').coerceTo('NUMBER');
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
      return row('totalValue').coerceTo('NUMBER');
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
      return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050")); 
    }).concatMap(function(row) {
        return row('items')
    }).filter((row) => {
      return row('referenced').eq(true); 
    }).count().run(this.rethinkDB).then((totalReferenced) => {
      if (totalReferenced === 0) {
        this.logger.log('No sales this month.');
        return 0;
      } else {
        return r.db('salesDASH').table('salesOrders').filter((row) => {
          return r.and(row('creationDate').month().eq(r.now().month()), row('type').eq("9050")); 
        }).concatMap(function(row) {
            return row('items')
        }).count().run(this.rethinkDB).then((totalQuotations) => {
          return totalReferenced / totalQuotations;
        })
      }       
      this.logger.log('Got hit rate percentage this month.');
    }).then((hitRate) => {
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsHitRateCurrentMonth', value: math.format(hitRate, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Hit rate of current month udpated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    r.db('salesDASH').table('salesOrders').filter((row) => {
      return r.and(row('creationDate').year().eq(r.now().year()), row('type').eq("9050")); 
    }).concatMap(function(row) {
        return row('items')
    }).filter((row) => {
      return row('referenced').eq(true); 
    }).count().run(this.rethinkDB).then((totalReferenced) => {
      if (totalReferenced === 0) {
        this.logger.log('No sales .');
        return 0;
      } else {
        return r.db('salesDASH').table('salesOrders').filter((row) => {
          return r.and(row('creationDate').year().eq(r.now().year()), row('type').eq("9050")); 
        }).concatMap(function(row) {
            return row('items')
        }).count().run(this.rethinkDB).then((totalQuotations) => {
          return totalReferenced / totalQuotations;
        })
      }       
      this.logger.log('Got hit rate percentage this year.');
    }).then((hitRate) => {
      r.db('salesDASH').table('dash').insert([{ field: 'quotationsHitRateCurrentYear', value: math.format(hitRate, {notation: 'fixed', precision: 2}) }], {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Hit rate of current year udpated.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack);
    });

    this.logger.log('Updating dash -- last five sales orders.' );
    r.db('salesDASH').table('salesOrders').orderBy(r.desc('creationDate')).outerJoin(r.db('salesDASH').table('customers'), function(salesOrder, customer) { 
      return salesOrder('soldTo').eq(customer('customer'))
    }).zip().pluck('docNumber', 'totalValue', 'name', 'customer' ).limit(5).run(this.rethinkDB).then((cursor) => {
        return cursor.toArray();
    }).then((lastFive) => {     
      r.db('salesDASH').table('dash').insert([{ field: 'lastFiveSalesOrders', value: lastFive }], {conflict: 'update'}).run(this.rethinkDB)
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
                const salesOrder: SalesOrder = {} as SalesOrder;
                const salesOrderItem: SalesOrderItem = {} as SalesOrderItem;
                let day, month, year, hour, minute, second;
                let currentSalesOrder;
                salesOrder.items = [];

                $(this).find('nobr').each( function(y, nobrElem) {
                // console.info($(this).children().children().text());
                    const currentCell = $(this).text().replace(/^\s+|\s+$/g, '')

                    if (header[y] === "docNumber"){
                        salesOrder.docNumber = parseInt(currentCell, 10);
                        currentSalesOrder = parseInt(currentCell, 10);
                    } else if (header[y] === "creationDate") {
                        [day, month, year] = currentCell.split('.');
                    } else if (header[y] === "time") {
                        [hour, minute, second] = currentCell.split(':');
                    } else if (header[y] === 'type') {
                        salesOrder.type = currentCell;
                    } else if (header[y] === 'createdBy') {
                        salesOrder.createdBy = currentCell;
                    } else if (header[y] === 'sOrg') {
                        salesOrder.sOrg = currentCell;
                    } else if (header[y] === 'sOff') {
                        salesOrder.sOff = currentCell;
                    } else if (header[y] === 'totalValue') {
                        salesOrder.totalValue = currentCell.replace(/\./g, '').replace(/\,/g, '.');
                    } else if (header[y] === 'soldTo') {
                        salesOrder.soldTo = parseInt(currentCell, 10);
                    } else if (header[y] === 'item') {
                        salesOrderItem.item = parseInt(currentCell, 10);
                    }  else if (header[y] === 'netValue') {                      
                        salesOrderItem.netValue = currentCell.replace(/\./g, '').replace(/\,/g, '.');
                    }  else if (header[y] === 'followDoc') {
                        (currentCell !== '') ? salesOrderItem.referenced = true : salesOrderItem.referenced = false;                
                    } else if (currentCell !== '') {
                      salesOrder[header[y]] = currentCell;
                    }

                });

                salesOrder.creationDate = r.time(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), '+01:00');
                if (data.findIndex(k => k.docNumber === currentSalesOrder) < 0) {
                  data.push(salesOrder);
                }
                data[data.findIndex(k => k.docNumber === currentSalesOrder)].items.push(salesOrderItem);

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