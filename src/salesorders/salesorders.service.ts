import {
  Inject,
  Injectable,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as soap from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import * as math from 'mathjs';

import { LoggerService } from '../common/logging.service';
import { InjectConfig } from 'nestjs-config';

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
  private readonly logger: LoggerService = new LoggerService(
    SalesOrdersService.name,
  );
  constructor(
    @Inject('rethinkDB') private readonly rethinkDB,
    @InjectConfig() private readonly config,
  ) {}

  onModuleInit() {
    // UPDATE THE CITY AND STATE OF ORDERS
    // r.db('salesDASH').table('salesOrders').filter(
    //     r.row.hasFields('city', 'state').not()
    // ).forEach(function (salesOrder) {
    //   return r.db('salesDASH').table('salesOrders').get(salesOrder('docNumber')).update(r.db('salesDASH').table('customers').get(salesOrder('soldTo')).pluck('city', 'state'), {'nonAtomic': true})
    // })
    // GET ORDERS BY STATE || CITY
    // r.db('salesDASH').table('salesOrders').filter(
    //   r.and(r.row.hasFields('state'), r.row('type').eq("9210"))
    // ).group('state').sum((salesOrder) => {
    //   return salesOrder('totalValue').coerceTo('NUMBER');
    // }).ungroup().map(function(row){
    //   return r.object(row('group'), row('reduction'));
    // }).reduce(function(left, right) {
    //     return left.merge(right);
    // })
    // ANOTHER OPTION
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

  // Exemple query http://localhost/salesorders/data?state=SP&groupBy=state&type=9210&startDate=01.01.2018&endDate=20.01.2019
  async getSalesData(query) {
    const [startDay, startMonth, startYear] = query.startDate.split('.');
    const [endDay, endMonth, endYear] = query.endDate.split('.');
    const groupBy = query.groupBy;

    delete query.startDate;
    delete query.endDate;
    delete query.groupBy;

    return await r
      .db('salesDASH')
      .table('salesOrders')
      .filter(
        (filterObject => {
          let condition;

          // tslint:disable-next-line:forin
          for (const key in filterObject) {
            let conditionForThisKey;
            if (typeof key === 'string' || typeof key === 'number') {
              conditionForThisKey = r.row(key).eq(filterObject[key]);
            } else {
              conditionForThisKey = r
                .row(key)
                [filterObject[key][0]](filterObject[key][1]);
            }

            if (typeof condition === 'undefined') {
              condition = conditionForThisKey;
            } else {
              condition = condition.and(conditionForThisKey);
            }
          }

          return condition;
        })(query),
      )
      .filter(salesOrder => {
        return salesOrder('creationDate').during(
          r.time(
            parseInt(startYear, 10),
            parseInt(startMonth, 10),
            parseInt(startDay, 10),
            0,
            0,
            0,
            '-03:00',
          ),
          r.time(
            parseInt(endYear, 10),
            parseInt(endMonth, 10),
            parseInt(endDay, 10),
            23,
            59,
            59,
            '-03:00',
          ),
          { leftBound: 'closed', rightBound: 'closed' },
        );
      })
      .group(groupBy)
      .sum(salesOrder => {
        return salesOrder('totalValue').coerceTo('NUMBER');
      })
      .ungroup()
      .map(row => {
        return r.object(
          groupBy === 'city' ? 'city' : 'UF',
          row('group'),
          'sales',
          row('reduction'),
        );
      })
      .run(this.rethinkDB)
      .then(result => {
        result.forEach(element => {
          element.sales = math.format(element.sales, {
            notation: 'fixed',
            precision: 2,
          });
        });
        return result;
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  async getTotals() {
    return await r.db('salesDASH').table('salesOrders').filter(row => {
      return row('creationDate').gt(r.now().sub(60 * 60 * 24 * 13)); // only include records from the last 31 days
    }).group(
      [r.row('type'), r.row('creationDate').day(), r.row('creationDate').month()],
    ).count().ungroup()
      .map(row => {
        return r.object(
          'type',
          row('group')(0),
          'day',
          row('group')(1),
          'month',
          row('group')(2),
          'count',
          row('reduction'),
        );
      })
      .run(this.rethinkDB)
      .then(async result => {
        return await r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'pastOrdersChart',
                value: result,
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(results => {
            this.logger.log('Past orders chart updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  async updateDash() {
    const today = new Date();
    // const wait = (ms) => new Promise(res => setTimeout(res, ms));

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .month()
            .eq(r.now().month()),
          row('type').eq('9210'),
        );
      })
      .sum(row => {
        return row('totalValue').coerceTo('NUMBER');
      })
      .run(this.rethinkDB)
      .then(totalValue => {
        this.logger.log('Got total value sales orders this month.');
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'salesOrdersTotalValueCurrentMonth',
                value: math.format(totalValue, {
                  notation: 'fixed',
                  precision: 2,
                }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('total Sales orders this month updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .month()
            .eq(r.now().month()),
          row('type').eq('9050'),
        );
      })
      .sum(row => {
        return row('totalValue').coerceTo('NUMBER');
      })
      .run(this.rethinkDB)
      .then(totalValue => {
        this.logger.log('Got total value quotations this month.');
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'quotationsTotalValueCurrentMonth',
                value: math.format(totalValue, {
                  notation: 'fixed',
                  precision: 2,
                }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('total Sales orders this month updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .year()
            .eq(r.now().year()),
          row('type').eq('9210'),
        );
      })
      .sum(row => {
        return row('totalValue').coerceTo('NUMBER');
      })
      .run(this.rethinkDB)
      .then(totalValue => {
        this.logger.log('Got total value sales orders this year.');
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'salesOrdersTotalValueCurrentYear',
                value: math.format(totalValue, {
                  notation: 'fixed',
                  precision: 2,
                }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('total Sales orders this year updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .year()
            .eq(r.now().year()),
          row('type').eq('9050'),
        );
      })
      .sum(row => {
        return row('totalValue').coerceTo('NUMBER');
      })
      .run(this.rethinkDB)
      .then(totalValeu => {
        this.logger.log('Got total value quotations this year.');
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'quotationsTotalValueCurrentYear',
                value: math.format(totalValeu, {
                  notation: 'fixed',
                  precision: 2,
                }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('total quotations this year updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .month()
            .eq(r.now().month()),
          row('type').eq('9050'),
        );
      })
      .concatMap(row => {
        return row('items');
      })
      .filter(row => {
        return row('referenced').eq(true);
      })
      .count()
      .run(this.rethinkDB)
      .then(totalReferenced => {
        if (totalReferenced === 0) {
          this.logger.log('No sales this month.');
          return 0;
        } else {
          return r
            .db('salesDASH')
            .table('salesOrders')
            .filter(row => {
              return r.and(
                row('creationDate')
                  .month()
                  .eq(r.now().month()),
                row('type').eq('9050'),
              );
            })
            .concatMap(row => {
              return row('items');
            })
            .count()
            .run(this.rethinkDB)
            .then(totalQuotations => {
              return totalReferenced / totalQuotations;
            });
        }
        this.logger.log('Got hit rate percentage this month.');
      })
      .then(hitRate => {
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'quotationsHitRateCurrentMonth',
                value: math.format(hitRate, { notation: 'fixed', precision: 2 }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Hit rate of current month udpated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    r.db('salesDASH')
      .table('salesOrders')
      .filter(row => {
        return r.and(
          row('creationDate')
            .year()
            .eq(r.now().year()),
          row('type').eq('9050'),
        );
      })
      .concatMap(row => {
        return row('items');
      })
      .filter(row => {
        return row('referenced').eq(true);
      })
      .count()
      .run(this.rethinkDB)
      .then(totalReferenced => {
        if (totalReferenced === 0) {
          this.logger.log('No sales .');
          return 0;
        } else {
          return r
            .db('salesDASH')
            .table('salesOrders')
            .filter(row => {
              return r.and(
                row('creationDate')
                  .year()
                  .eq(r.now().year()),
                row('type').eq('9050'),
              );
            })
            .concatMap(row => {
              return row('items');
            })
            .count()
            .run(this.rethinkDB)
            .then(totalQuotations => {
              return totalReferenced / totalQuotations;
            });
        }
        this.logger.log('Got hit rate percentage this year.');
      })
      .then(hitRate => {
        r.db('salesDASH')
          .table('dash')
          .insert(
            [
              {
                field: 'quotationsHitRateCurrentYear',
                value: math.format(hitRate, { notation: 'fixed', precision: 2 }),
              },
            ],
            { conflict: 'update' },
          )
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Hit rate of current year udpated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    this.logger.log('Updating dash -- last five sales orders.');
    r.db('salesDASH')
      .table('salesOrders')
      .orderBy(r.desc('creationDate'))
      .limit(5)
      .outerJoin(
        r.db('salesDASH').table('customers').without('creationDate'),
        (salesOrder, customer) => {
          return salesOrder('soldTo').eq(customer('customer'));
        },
      )
      .zip()
      .pluck('docNumber', 'creationDate', 'totalValue', 'name', 'customer')
      .run(this.rethinkDB)
      .then(cursor => {
        return cursor.toArray();
      })
      .then(lastFive => {
        r.db('salesDASH')
          .table('dash')
          .insert([{ field: 'lastFiveSalesOrders', value: lastFive }], {
            conflict: 'update',
          })
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Last five sales orders updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  async updateData(path: string, type: string) {
    this.logger.log('Gotcha ya!');
    const $ = cheerio.load(fs.readFileSync(path));

    // get header
    const header = [];
    const data = [];
    try {
      if (type === '.htm') {
        $('tbody')
          .first()
          .children()
          .find('nobr')
          .each(function(i, elem) {
            const columnHeader = $(this)
              .text()
              .replace(/^\s+|\s+$/g, '');
            header.push(columnHeader);
          });

        $('tbody').each(function(i, tbodyElem) {
          $(this)
            .next()
            .find('tr')
            .each(function(j, trElem) {
              const salesOrder: SalesOrder = {} as SalesOrder;
              const salesOrderItem: SalesOrderItem = {} as SalesOrderItem;
              let day, month, year, hour, minute, second;
              let currentSalesOrder;
              salesOrder.items = [];

              $(this)
                .find('nobr')
                .each(function(y, nobrElem) {
                  // console.info($(this).children().children().text());
                  const currentCell = $(this)
                    .text()
                    .replace(/^\s+|\s+$/g, '');

                  if (header[y] === 'docNumber') {
                    salesOrder.docNumber = parseInt(currentCell, 10);
                    currentSalesOrder = parseInt(currentCell, 10);
                  } else if (header[y] === 'creationDate') {
                    [day, month, year] = currentCell.split('.');
                  } else if (header[y] === 'time') {
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
                    salesOrder.totalValue = currentCell
                      .replace(/\./g, '')
                      .replace(/\,/g, '.');
                  } else if (header[y] === 'soldTo') {
                    salesOrder.soldTo = parseInt(currentCell, 10);
                  } else if (header[y] === 'item') {
                    salesOrderItem.item = parseInt(currentCell, 10);
                  } else if (header[y] === 'netValue') {
                    salesOrderItem.netValue = currentCell
                      .replace(/\./g, '')
                      .replace(/\,/g, '.');
                  } else if (header[y] === 'followDoc') {
                    currentCell !== ''
                      ? (salesOrderItem.referenced = true)
                      : (salesOrderItem.referenced = false);
                  } else if (currentCell !== '') {
                    salesOrder[header[y]] = currentCell;
                  }
                });

              salesOrder.creationDate = r.time(
                parseInt(year, 10),
                parseInt(month, 10),
                parseInt(day, 10),
                parseInt(hour, 10),
                parseInt(minute, 10),
                parseInt(second, 10),
                '+01:00',
              );
              if (data.findIndex(k => k.docNumber === currentSalesOrder) < 0) {
                data.push(salesOrder);
              }
              data[
                data.findIndex(k => k.docNumber === currentSalesOrder)
              ].items.push(salesOrderItem);
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
    return await r
      .db('salesDASH')
      .table('salesOrders')
      .insert(data, { conflict: 'update' })
      .run(this.rethinkDB)
      .then(result => {
        this.logger.log('Data uploaded to DB.');
        fs.unlink(path, err => {
          if (err) throw err;
          this.logger.warn('Treated file deleted: ' + path);
        });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  private reduceArray(prop) {
    return (ele, i, arr) =>
      arr.map(element => element[prop]).indexOf(ele[prop]) === i;
  }
}
