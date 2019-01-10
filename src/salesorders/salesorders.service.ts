import { Inject, Injectable, BadRequestException, LoggerService } from '@nestjs/common';
import * as soap from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class SalesOrdersService {
  constructor( 
    @Inject('rethinkDB') private readonly rethinkDB, 
    @InjectConfig() private readonly config
  ) { }

  /**
   * @param contact Simple Interface.
   * @param ownerId The UserID of who's trying to add a new contact.
   * @return Returns the created contact.
   */
  async find(salesOrderID: string) {
    const soap = require('soap');
    const url = './src/ws/ecc_salesorder009qr.wsdl';
    let salesOrder = 0;
    const args = { 
      SalesOrderSelectionByElements: { 
        SelectionByID: { 
          IntervalBoundaryTypeCode: 1, 
          LowerBoundarySalesOrganisationID: salesOrderID
        }
      },
      ProcessingConditions: {
        QueryHitsMaximumNumberValue: 1
      }
    };
    await soap.createClientAsync(url).then((client) => {
      client.setSecurity(new soap.BasicAuthSecurity('u228820', 'cp1205rm28f='));  
      return client.SalesOrderERPBasicDataByElementsQueryResponse_InAsync(args)
    }).then((result) => {
      console.log(result);
      salesOrder = result
    });
    return salesOrder;
  }

  async updateData(path: string) {
    // r.dbCreate('salesDASH').run(this.rethinkDB)
    // .then((result) => {
    //    console.info(JSON.stringify(result, null, 2));     
    // }).catch(function(err) {
    //     console.info(JSON.stringify(err, null, 2));
    // });

    console.log("gotcha ya");
    const $ = cheerio.load(fs.readFileSync(path));

    $('table').each( function(i, elem) {
      $(this).children('tbody').next().find('tr').each( function(i, elem) {
        $(this).find('td').each( function(i, elem) {
          // console.info($(this).children().children().text());
        })
      })
    })
  }

  async findTotalThisMonth() {
    // const date = new Date();
    // const firstDay = new Date(date.getFullYear(), date.getMonth() - 5, 1);
    // const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    // let totalOrders = 0;
    // const soap = require('soap');
    // const url = './src/ws/ecc_salesorder009qr.wsdl';
    // const args = { 
    //   SalesOrderSelectionByElements: { 
    //     SelectionBySalesOrganisationID: { 
    //       IntervalBoundaryTypeCode: 1, 
    //       LowerBoundarySalesOrganisationID: '0022'
    //     },
    //     SelectionByCreationDate: {
    //       IntervalBoundaryTypeCode: 3,
    //       LowerBoundaryCreationDate: firstDay.toISOString().slice(0,10),
    //       UpperBoundaryCreationDate: lastDay.toISOString().slice(0,10)
    //     }
    //   },
    //   ProcessingConditions: {
    //     QueryHitsMaximumNumberValue: 50
    //   }
    // };

    // await soap.createClientAsync(url).then((client) => {
    //     client.setSecurity(new soap.BasicAuthSecurity('u228820', 'cp1205rm28f='));  
    //     return client.SalesOrderERPBasicDataByElementsQueryResponse_InAsync(args)
    // }).then((result) => {
    //   // console.log(result);
    //   r.connect({ host: 'localhost', port: 28015 }, function(err, conn){
    //     if(err) throw err;
    //     r.db('test').tableCreate('sales_order').run(conn, function(err, res){
    //       if(err) throw err;
    //       console.log(res);
    //       r.table('sales_order').insert(result[0].SalesOrder).run(conn, function(err, res){
    //         if (err) throw err;
    //         console.log(res);
    //       })
    //     })
    //   })
    //   totalOrders = result[0].SalesOrder.length;
    // });

    // await r.table('sales_order').count().run(this.rethinkDB, function(err, result) {
    //   if (err) throw err;
    //   console.log(JSON.stringify(result, null, 2));
    //   return JSON.stringify(result, null, 2);  
    // });
    // return 0;

    return await r.table('sales_order').count().run(this.rethinkDB)
    .then((result) => {
      return JSON.stringify(result, null, 2);     
    }).catch(function(err) {
        // process error
    });
  }
}