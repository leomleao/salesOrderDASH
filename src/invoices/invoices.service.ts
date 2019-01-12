import { Inject, Injectable, BadRequestException, LoggerService } from '@nestjs/common';
import * as soap from 'soap';
import * as r from 'rethinkdb';
import * as fs from 'fs';
import * as cheerio from 'cheerio';
import Big from 'big.js';

import { InjectConfig  } from 'nestjs-config';

@Injectable()
export class InvoicesService {
  constructor( 
    @Inject('rethinkDB') private readonly rethinkDB, 
    @InjectConfig() private readonly config
  ) { }  

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
  }  

  async groupInvoices( ) {
    console.info("grouping invoices");
    const invoices = [
      // {
      //   invoiceNumber: 34555,
      //   taxType: "IPI",
      //   taxValue:  Big(543.1),
      //   totalValue: Big(10221.43)
      // },
      // {
      //   invoiceNumber: 34555,
      //   taxType: "PIS",
      //   taxValue:  Big(312.1),
      //   totalValue: Big(10221.43)
      // },
      // {
      //   invoiceNumber: 34555,
      //   taxType: "COFINS",
      //   taxValue:  Big(53.11),
      //   totalValue: Big(10221.43)
      // },
      // {
      //   invoiceNumber: 34555,
      //   taxType: "ICMS",
      //   taxValue:  Big(483.12),
      //   totalValue: Big(10221.43)
      // },
      {
        invoiceNumber: 39778,
        taxType: "IPI",
        taxValue:  Big(383),
        totalValue: Big(7088)
      },
      {
        invoiceNumber: 39778,
        taxType: "PIS",
        taxValue:  Big(102),
        totalValue: Big(7088)
      },
      {
        invoiceNumber: 39778,
        taxType: "COFINS",
        taxValue:  Big(392.1),
        totalValue: Big(7088)
      }
    ];


    const result = this.groupBy(invoices, this.demoComparator, this.demoOnDublicate);



  }


  async updateData(path: string, type: string) {
    console.log("gotcha ya");
    const $ = cheerio.load(fs.readFileSync(path));

    //get header
    let header = [];
    let data = [];
    if (type == ".htm") {
      $('tbody').first().children().find('nobr').each( function(i, elem) {
        header.push($(this).text().replace(/^\s+|\s+$/g, ''));
      });

      $('tbody').each( function(i, elem) {
        $(this).next().find('tr').each( function(i, elem) {
          let row = {};

          $(this).find('nobr').each( function(i, elem) {
          // console.info($(this).children().children().text());
            if (header[i] == "Customer"){            
              row[header[i]] = parseInt($(this).text().replace(/^\s+|\s+$/g, ''));              
            } if (header[i] == "Date"){ 
              const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split(".");
              row[header[i]] = new Date(year, month - 1, day); 
            } else {        
              row[header[i]] = $(this).text().replace(/^\s+|\s+$/g, '');
            }
          })
          data.push(row);
        })
      });
    } else if (type == ".HTM"){
      $('tbody').first().find('tr').find('td').each( function(i, elem) {
        header.push($(this).text().replace(/^\s+|\s+$/g, ''));
      });

      $('tbody').first().find('tr').each( function(i, elem) {

        let row = {};
        if (i != 0) {
          $(this).find('td').each( function(i, elem) {
          // console.info($(this).children().children().text());
            if (header[i] == "Customer"){            
              row[header[i]] = parseInt($(this).text().replace(/^\s+|\s+$/g, ''));              
            } if (header[i] == "Date"){ 
              const [day, month, year] = $(this).text().replace(/^\s+|\s+$/g, '').split(".");
              row[header[i]] = new Date(year, month - 1, day); 
            } else {        
              row[header[i]] = $(this).text().replace(/^\s+|\s+$/g, '');
            }
          })
          data.push(row);
        }
      });  
    }

    console.log("data treated");

    return await r.db('salesDASH').table('customers').insert(data, {conflict: "update"}).run(this.rethinkDB)
      .then((result) => {
        console.info(JSON.stringify(result, null, 2)); 
        fs.unlink(path, (err) => {
          if (err) throw err;
          console.info("file deleted");
        });    
        console.log("file would have been deleted now");
      }).catch(function(err) {
        console.info(JSON.stringify(err, null, 2));  
      });        

    console.info(JSON.stringify(data))    
  }

  private demoComparator = (v1: any, v2: any) => {
    return v1.invoiceNumber === v2.invoiceNumber;
  }

  private demoOnDublicate = (uniqueRow, dublicateRow) => {
    uniqueRow.taxValue = uniqueRow.taxValue.plus(dublicateRow.taxValue);    
  };

  private groupBy(data: any[], comparator: (v1: any, v2: any) => boolean, onDublicate: (uniqueRow: any, dublicateRow: any) => void) {
    return data.reduce(function (reducedRows, currentlyReducedRow) {
      let processedRow = reducedRows.find(searchedRow => comparator(searchedRow, currentlyReducedRow));
      if (processedRow) {
        // currentlyReducedRow is a dublicateRow when processedRow is not null.
        processedRow.totalValue = processedRow.totalValue.minus(currentlyReducedRow.taxValue);        
        onDublicate(processedRow, currentlyReducedRow)
      } else {
        // currentlyReducedRow is unique and must be pushed in the reducedRows collection.
        currentlyReducedRow.totalValue = currentlyReducedRow.totalValue.minus(currentlyReducedRow.taxValue);
        reducedRows.push(currentlyReducedRow);
      }
      return reducedRows;
    }, []);
  };

}