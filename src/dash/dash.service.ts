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
  constructor(
    @Inject('rethinkDB') private readonly rethinkDB,
    ) { }

  afterInit() {
    const socketInstance = this.server;
    r.table('dash').changes().run(this.rethinkDB, (error, cursor) => {
        if (error) throw error;
        cursor.each((err, row) => {
            if (err) throw err;
            // console.log(JSON.stringify(row, null, 2));
            socketInstance.emit('changes', row);
        });
    });
  }

  async getNewData() {
    return await r.db('salesDASH').table('dash').run(this.rethinkDB)
    .then((result) => {
      return result.toArray();
    }).catch((err) => {
      // console.info(err);
        // process error
    });
  }

  async findTotalThisMonth() {
    return await r.db('salesDASH').table('sales_order').count().run(this.rethinkDB)
    .then((result) => {
      return result.toArray();
    }).catch((err) => {
        // process error
    });
  }

}