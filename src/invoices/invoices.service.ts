import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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

interface InvoiceItem {
  docNumber: any;
  type: any;
  procDate: any;
  partnerID: any;
  name: any;
  city: any;
  region: any;
  totalValue: any;
}

interface GraphColumn {
  month: string;
  sales: any;
  salesPast: any;
  negativeSales: any;
  negativeSalesPast: any;
  goal: any;
}

@Injectable()
export class InvoicesService implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService(
    InvoicesService.name,
  );
  constructor(
    @Inject('rethinkDB') private readonly rethinkDB,
    @InjectConfig() private readonly config,
  ) {}

  onModuleInit() {
    // console.log(`Initialization...`);
    // r.table('dash').changes().run(this.rethinkDB, function(err, cursor) {
    //     if (err) throw err;
    //     this.InvoicesServices.updateInvoiceTotals();
    // });
  }

  async updateDash() {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    this.logger.log('Updating dash -- total sales.');
    r.db('salesDASH')
      .table('invoiceTotals')
      .run(this.rethinkDB)
      .then(cursor => {
        return cursor.toArray();
      })
      .then(invoiceTotals => {
        r.db('salesDASH')
          .table('goals')
          .run(this.rethinkDB)
          .then(cursor => {
            return cursor.toArray();
          })
          .then(goals => {
            // process the results
            const data = [];

            for (let i = 0; i <= 11; i++) {
              const current: GraphColumn = {} as GraphColumn;
              let test;
              current.month = months[i];
              current.sales =
                typeof (test = invoiceTotals.find(
                  sales => sales.period === i + 1 + '.' + year,
                )) === 'object'
                  ? test.value
                  : null;
              current.salesPast =
                typeof (test = invoiceTotals.find(
                  sales => sales.period === i + 1 + '.' + (year - 1),
                )) === 'object'
                  ? test.value
                  : null;
              current.negativeSales =
                typeof (test = invoiceTotals.find(
                  sales => sales.period === i + 1 + '.' + year,
                )) === 'object'
                  ? test.negativeValue
                    ? test.negativeValue
                    : null
                  : null;
              current.negativeSalesPast =
                typeof (test = invoiceTotals.find(
                  sales => sales.period === i + 1 + '.' + (year - 1),
                )) === 'object'
                  ? test.negativeValue
                    ? test.negativeValue
                    : null
                  : null;
              current.goal =
                typeof (test = goals.find(
                  sales => sales.period === i + 1 + '.' + year,
                )) === 'object'
                  ? test.value
                  : 0;
              data.push(current);
            }

            r.db('salesDASH')
              .table('dash')
              .insert([{ field: 'chartData', value: data }], {
                conflict: 'update',
              })
              .run(this.rethinkDB)
              .then(result => {
                this.logger.log('Sales graph data updated.');
              });
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    this.logger.log('Updating dash -- last five.');
    r.db('salesDASH')
      .table('invoices')
      .filter(r.row('type').eq('Z210'))
      .orderBy(r.desc('procDate'))
      .limit(5)
      .run(this.rethinkDB)
      .then(cursor => {
        return cursor.toArray();
      })
      .then(lastFive => {
        r.db('salesDASH')
          .table('dash')
          .insert([{ field: 'lastFiveInvoices', value: lastFive }], {
            conflict: 'update',
          })
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Sales graph data updated.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });

    this.logger.log('Updating goal fulfillment.');

    r.db('salesDASH')
      .table('invoiceTotals')
      .filter(r.row('period').match(year + '$'))
      .run(this.rethinkDB)
      .then(cursor => {
        return cursor.toArray();
      })
      .then(invoiceTotals => {
        r.db('salesDASH')
          .table('goals')
          .run(this.rethinkDB)
          .then(cursor => {
            return cursor.toArray();
          })
          .then(goals => {
            // process the results
            let test;
            let totalYearlySold;
            let totalYearlyGoal;
            const totalMonthlySold =
              typeof (test = invoiceTotals.find(
                sales => sales.period === month + 1 + '.' + year,
              )) === 'object'
                ? test.value
                : 0;
            const totalMonthlyGoal =
              typeof (test = goals.find(
                salesGoal => salesGoal.period === month + 1 + '.' + year,
              )) === 'object'
                ? test.value
                : 0;

            const fulfillmentMonth =
              totalMonthlyGoal > 0
                ? math.format(math.divide(totalMonthlySold, totalMonthlyGoal))
                : '0';

            for (let i = 0; i <= 11; i++) {
              totalYearlySold = math.format(
                math.add(
                  totalYearlySold || 0,
                  typeof (test = invoiceTotals.find(
                    sales => sales.period === i + 1 + '.' + year,
                  )) === 'object'
                    ? test.value
                    : 0,
                ),
              );
              totalYearlyGoal = math.add(
                totalYearlyGoal || 0,
                typeof (test = goals.find(
                  salesGoals => salesGoals.period === i + 1 + '.' + year,
                )) === 'object'
                  ? test.value
                  : 0,
              );
            }

            const fulfillmentYear =
              totalYearlyGoal > 0
                ? math.format(math.divide(totalYearlySold, totalYearlyGoal))
                : '0';

            r.db('salesDASH')
              .table('dash')
              .insert(
                [
                  {
                    field: 'goalFulfillmentCurrentMonth',
                    value: fulfillmentMonth,
                  },
                  {
                    field: 'goalFulfillmentCurrentYear',
                    value: fulfillmentYear,
                  },
                ],
                {
                  conflict: 'update',
                },
              )
              .run(this.rethinkDB)
              .then(result => {
                this.logger.log('Sales graph data updated.');
              });
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  async updateInvoiceTotals() {
    r.db('salesDASH')
      .table('invoices')
      // .filter(r.row.hasFields('cancDate').not())
      .group([r.row('procDate').month(), r.row('procDate').year()])
      .sum(invoice => {
        return r.branch(
          r.or(
            invoice('type').eq('ZS1'),
            invoice('type').eq('Z612'),
            invoice('type').eq('Z611'),
            invoice('type').eq('Z310'),
          ),
          invoice('totalValue')
            .coerceTo('NUMBER')
            .mul(-1),
          invoice('totalValue').coerceTo('NUMBER'),
        );
      })
      .run(this.rethinkDB)
      .then(result => {
        const data = [];
        for (let i = result.length - 1; i >= 0; i--) {
          data.push({
            period: result[i].group[0] + '.' + result[i].group[1],
            value: math.number(
              math.format(result[i].reduction, {
                notation: 'fixed',
                precision: 2,
              }),
            ),
          });
        }
        return data;
      })
      .then(totals => {
        r.db('salesDASH')
          .table('invoiceTotals')
          .insert(totals, { conflict: 'update' })
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Invoice totals updated on dash.');
          });
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
  }

  async updateInvoiceNegativeValues() {
    r.db('salesDASH')
      .table('invoices')
      .filter(r.or(r.row('type').match('ZS1')))
      .group([r.row('procDate').month(), r.row('procDate').year()])
      .sum(invoice => {
        return invoice('totalValue').coerceTo('NUMBER');
      })
      .run(this.rethinkDB)
      .then(result => {
        const data = [];
        for (let i = result.length - 1; i >= 0; i--) {
          data.push({
            period: result[i].group[0] + '.' + result[i].group[1],
            negativeValue: math.number(
              math.format(result[i].reduction, {
                notation: 'fixed',
                precision: 2,
              }),
            ),
          });
        }
        return data;
      })
      .then(totals => {
        r.db('salesDASH')
          .table('invoiceTotals')
          .insert(totals, { conflict: 'update' })
          .run(this.rethinkDB)
          .then(result => {
            this.logger.log('Invoice negative values updated on dash.');
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
              const row: InvoiceItem = {} as InvoiceItem;
              row.totalValue = 0;
              let day, month, year, hour, minute, second;

              $(this)
                .find('nobr')
                .each(function(y, nobrElem) {
                  // console.info($(this).children().children().text());
                  const currentCell = $(this)
                    .text()
                    .replace(/^\s+|\s+$/g, '');

                  if (header[y].indexOf('docNumber') >= 0) {
                    row.docNumber = parseInt(currentCell, 10);
                  } else if (header[y].indexOf('type') >= 0) {
                    row.type = currentCell;
                  } else if (header[y].indexOf('procDate') >= 0) {
                    [day, month, year] = currentCell.split('.');
                  } else if (header[y].indexOf('procTime') >= 0) {
                    [hour, minute, second] = currentCell.split(':');
                  } else if (header[y].indexOf('partnerID') >= 0) {
                    row.partnerID = parseInt(currentCell, 10);
                  } else if (header[y].indexOf('totalValue') >= 0) {
                    if (currentCell.indexOf('-') >= 0) {
                      row.totalValue =
                        '-' +
                        currentCell
                          .replace(/\-/g, '')
                          .replace(/\./g, '')
                          .replace(/\,/g, '.');
                    } else {
                      row.totalValue = currentCell
                        .replace(/\-/g, '')
                        .replace(/\./g, '')
                        .replace(/\,/g, '.');
                    }
                  } else if (currentCell !== '') {
                    row[header[y]] = currentCell;
                  }
                });

              row.procDate = r.time(
                parseInt(year, 10),
                parseInt(month, 10),
                parseInt(day, 10),
                parseInt(hour, 10),
                parseInt(minute, 10),
                parseInt(second, 10),
                '+01:00',
              );

              data.push(row);
            });
        });
      }
    } catch (err) {
      this.logger.error(err, err.stack);
    }

    this.logger.log('Invoice data treated.');

    // console.info(JSON.stringify(data));
    // return this.groupBy(data, this.demoComparator, this.demoOnDublicate).then(
    //   async groupedInvoices => {
    return await r
      .db('salesDASH')
      .table('invoices')
      .insert(data, { conflict: 'update' })
      .run(this.rethinkDB)
      .then(result => {
        this.logger.log('Data uploaded to DB.');
        fs.unlink(path, err => {
          if (err) throw err;
          this.logger.warn('Treated file deleted: ' + path);
        });
        // console.log('file would have been deleted now');
      })
      .catch(err => {
        this.logger.error(err, err.stack);
      });
    //   },
    // );

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
    uniqueRow.totalValue = math.format(
      math.add(
        math.bignumber(uniqueRow.totalValue),
        math.bignumber(dublicateRow.totalValue),
      ),
    );
  }

  private async groupBy(
    data: any[],
    comparator: (v1: any, v2: any) => boolean,
    onDublicate: (uniqueRow: any, dublicateRow: any) => void,
  ) {
    return data.reduce((reducedRows, currentlyReducedRow) => {
      const processedRow = reducedRows.find(searchedRow =>
        comparator(searchedRow, currentlyReducedRow),
      );
      if (processedRow) {
        // currentlyReducedRow is a dublicateRow when processedRow is not null.
        onDublicate(processedRow, currentlyReducedRow);
      } else {
        // currentlyReducedRow is unique and must be pushed in the reducedRows collection.
        reducedRows.push(currentlyReducedRow);
      }
      return reducedRows;
    }, []);
  }
}
