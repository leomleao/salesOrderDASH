import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as soapLib from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { LoggerService } from '../common/logging.service';
import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class CustomersService {
  private readonly logger: LoggerService = new LoggerService(CustomersService.name);
  constructor(
    @Inject('rethinkDB') private readonly rethinkDB,
    @InjectConfig() private readonly config,
  ) { }

  /**
   * @param contact Simple Interface.
   * @param ownerId The UserID of who's trying to add a new contact.
   * @return Returns the created contact.
   */
  async find(salesOrderID: string) {
    const soap = require('soapLib');
    const url = './src/ws/ecc_salesorder009qr.wsdl';
    let salesOrder = 0;
    const args = {
      SalesOrderSelectionByElements: {
        SelectionByID: {
          IntervalBoundaryTypeCode: 1,
          LowerBoundarySalesOrganisationID: salesOrderID,
        },
      },
      ProcessingConditions: {
        QueryHitsMaximumNumberValue: 1,
      },
    };
    await soap.createClientAsync(url).then((client) => {
      client.setSecurity(new soap.BasicAuthSecurity('u228820', 'cp1205rm28f='));
      return client.SalesOrderERPBasicDataByElementsQueryResponse_InAsync(args);
    }).then((result) => {
      salesOrder = result;
    });
    return salesOrder;
  }

  async updateDash() {
    const data = [];
    this.logger.log('Updating dash -- total customers.' );
    r.db('salesDASH').table('customers').filter((row) => {
      return row('Date').gt(r.now().sub(60 * 60 * 24 * 31)); // only include records from the last 31 days
    }).orderBy(r.desc('Date')).count().run(this.rethinkDB)
    .then((newCustomers) => {
      data.push({ field: 'newCustomers', value: newCustomers });
      r.db('salesDASH').table('dash').insert(data, {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Updating dash -- ' + newCustomers + ' new customers.');
      });
    }).catch((err) => {
      this.logger.error(err, err.stack());
    });

    // return await r.db('salesDASH').table('customers').orderBy(r.desc('Date')).run(this.rethinkDB)
    // .then((result) => {
    //   // console.info(JSON.stringify(result, null, 2));
    //   console.info(JSON.stringify(result.filter((row) => {
    //     return row('Date').gt(r.now().sub(60 * 60 * 24 * 31)); // only include records from the last 14 days
    //   });
    //   ))
    // }).catch(function(err) {
    //   console.info(JSON.stringify(err, null, 2));
    // });

  }

  async updateData(path: string, type: string) {
    this.logger.log('Gotcha ya!');
    const $ = cheerio.load(fs.readFileSync(path));

    // get header
    const header = [];
    const data = [];
    if (type === '.htm') {
      $('tbody').first().children().find('nobr').each( function(i, elem) {
        header.push($(this).text().replace(/^\s+|\s+$/g, ''));
      });

      $('tbody').each( function(i, tbodyElem) {
        $(this).next().find('tr').each( function(k, trElem) {
          const row = {};

          $(this).find('nobr').each( function(y, nobrElem) {
          // console.info($(this).children().children().text());
            if (header[y] === 'Customer') {
              row[header[y]] = parseInt($(this).text().replace(/^\s+|\s+$/g, ''), 10);
            } else if (header[y] === 'Date') {
              const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split('.');
              row[header[y]] = new Date(year, month - 1, day);
            } else {
              row[header[y]] = $(this).text().replace(/^\s+|\s+$/g, '');
            }
          });
          data.push(row);
        });
      });
    } else if (type === '.HTM'){
      $('tbody').first().find('tr').find('td').each( function(i, tdElem) {
        header.push($(this).text().replace(/^\s+|\s+$/g, ''));
      });

      $('tbody').first().find('tr').each( function(k, trElem) {

        const row = {};
        if (k !== 0) {
          $(this).find('td').each( function(y, tdElem) {
          // console.info($(this).children().children().text());
            if (header[y] === 'Customer'){
              row[header[y]] = parseInt($(this).text().replace(/^\s+|\s+$/g, ''), 10);
            } else if (header[y] === 'Date'){
              const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split('.');
              row[header[y]] = new Date(year, month - 1, day);
            } else {
              row[header[y]] = $(this).text().replace(/^\s+|\s+$/g, '');
            }
          });
          data.push(row);
        }
      });
    }

    this.logger.log('Customer data treated.');

    return await r.db('salesDASH').table('customers').insert(data, {conflict: 'update'}).run(this.rethinkDB)
      .then((result) => {
        this.logger.log('Data uploaded to DB.');
        fs.unlink(path, (err) => {
          if (err) throw err;
          this.logger.warn('Treated file deleted: ' + path);
        });
        // console.log('file would have been deleted now');
      }).catch((err) => {
        this.logger.error(err, err.stack());
      });
    // console.info(JSON.stringify(data));
  }

}