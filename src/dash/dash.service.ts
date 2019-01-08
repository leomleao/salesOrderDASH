import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as r from 'rethinkdb';

@Injectable()
export class DashService {
  constructor( @Inject('rethinkDB') private readonly rethinkDB) { }
  
  async find(salesOrderID: string) {
   
  }

  async findTotalThisMonth() {
    return await r.table('sales_order').count().run(this.rethinkDB)
    .then((result) => {
      return JSON.stringify(result, null, 2);     
    }).catch(function(err) {
        // process error
    });
  }
}