import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as r from 'rethinkdb';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayInit,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
@WebSocketGateway()
export class DashService implements OnGatewayInit {
  @WebSocketServer() 
  server;
  constructor( @Inject('rethinkDB') private readonly rethinkDB) { } 


  afterInit() {
    const socketInstance = this.server;
    r.db('salesDASH').table('dash').changes().run(this.rethinkDB, function(err, cursor) {
        if (err) throw err;
        cursor.each(function(err, row) {
            if (err) throw err;
            console.log(JSON.stringify(row, null, 2));
            socketInstance.emit('changes', row);
        });
    });
  }
  
  async getNewData() {
    return await r.db('salesDASH').table('dash').run(this.rethinkDB)
    .then((result) => {
      console.info(JSON.stringify(result, null, 2))
      return JSON.stringify(result, null, 2);     
    }).catch(function(err) {
        // process error
    });
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