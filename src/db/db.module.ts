import { Module, Inject, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/logging.service';
import * as r from 'rethinkdb';

const dbProvider = {
  provide: 'rethinkDB',
  useValue: r.connect({ host: 'localhost', port: 28015, db: 'salesDASH' }),
};

@Module({
  components: [dbProvider],
  exports: [dbProvider],
})

export class DBModule implements OnModuleInit {
	private readonly logger: LoggerService = new LoggerService(DBModule.name);
	constructor(
	    @Inject('rethinkDB') private readonly rethinkDB,
  	) { }

	onModuleInit() {
		r.dbCreate('salesDASH').run(this.rethinkDB)
	    .then((result) => {

	 	}).catch((err) => {

	 	});
	 r.db('salesDASH').tableCreate('invoices', { primaryKey: 'docNumber'} ).run(this.rethinkDB)
	 	.catch((err) => {

	 	});
	 r.db('salesDASH').tableCreate('invoiceTotals', { primaryKey: 'period'} ).run(this.rethinkDB)
	    .catch((err) => {

	 	});
	 r.db('salesDASH').tableCreate('dash', {primaryKey: 'field'}).run(this.rethinkDB)
	    .catch((err) => {

	 	});
	 r.db('salesDASH').tableCreate('customers', {primaryKey: 'customer'}).run(this.rethinkDB)
	    .catch((err) => {

	 	});
	 r.db('salesDASH').tableCreate('salesOrders', {primaryKey: 'docNumber'}).run(this.rethinkDB)
	 	.then((result) =>{
	 		r.db('salesDASH').table('salesOrders').indexCreate('orderNumber').run(this.rethinkDB)
	 	})
	    .catch((err) => {

	 	});

	}
}