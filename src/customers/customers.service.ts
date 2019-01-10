import { Inject, Injectable, BadRequestException, LoggerService } from '@nestjs/common';
import * as soap from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class CustomersService {
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

  async updateDash() {
    let data = [];
    r.db('salesDASH').table('customers').count().run(this.rethinkDB)
    .then((result) => {
      const totalCustomers = result;
      // console.info('total customer --- ', totalCustomers);
      r.db('salesDASH').table('customers').filter((row) => {
        return row('Date').gt(r.now().sub(60 * 60 * 24 * 31)); // only include records from the last 31 days
      }).orderBy(r.desc('Date')).run(this.rethinkDB)
      .then((result) => {
        // console.info('total new customer --- ', result.length);
        data.push({ field: 'newCustomers', value: result.length });
        r.db('salesDASH').table('dash').insert(data, {conflict: "update"}).run(this.rethinkDB)
        .then((result) => {
          // console.info(JSON.stringify(result, null, 2));  
        })
      });                 
    }).catch(function(err) {
      console.info(JSON.stringify(err, null, 2));   
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

  async updateData(path: string) {
    console.log("gotcha ya");
    const $ = cheerio.load(fs.readFileSync(path));

    //get header
    let header = [];
    let data = [];
    $('tbody').first().children().find('nobr').each( function(i, elem) {
      header.push($(this).text().replace(/^\s+|\s+$/g, ''));
    });

    $('tbody').each( function(i, elem) {
      $(this).next().find('tr').each( function(i, elem) {
        let row = {};

        $(this).find('nobr').each( function(i, elem) {
        // console.info($(this).children().children().text());
          if (header[i] == "Date"){
            console.info($(this).text().replace(/^\s+|\s+$/g, ''));
            const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split(".");
            row[header[i]] = new Date(year, month - 1, day);            
          } else {        
            row[header[i]] = $(this).text().replace(/^\s+|\s+$/g, '');
          }
        })
        data.push(row);
      })
    });

    console.log("data treated");

    return await r.db('salesDASH').table('customers').insert(data, {conflict: "update"}).run(this.rethinkDB)
      .then((result) => {
        console.info(JSON.stringify(result, null, 2)); 
        // fs.stat(path, (err, stats) => {
        //   if (err) throw err;
        //   console.log(`stats: ${JSON.stringify(stats)}`);
        // });    

        console.log("file would have been deleted now");
      }).catch(function(err) {
        console.info(JSON.stringify(err, null, 2));  
      });    
      

    console.info(JSON.stringify(data))
    
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