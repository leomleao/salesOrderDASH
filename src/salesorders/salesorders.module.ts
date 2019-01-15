import { Module, Inject } from '@nestjs/common';
import { SalesOrdersController } from './salesorders.controller';
import { SalesOrdersService } from './salesorders.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [SalesOrdersController],
  providers: [
      SalesOrdersService,
  ],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {
	constructor(
	    @Inject('rethinkDB') private readonly rethinkDB,
  	) {
		r.tableCreate('customers').run(this.rethinkDB)
	    .then((result) => {
	       // console.info(JSON.stringify(result, null, 2));
	    }).catch((err) => {
	        // console.info(JSON.stringify(err, null, 2));
	    });
	}
}
