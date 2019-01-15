import { Module, Inject, OnModuleInit } from '@nestjs/common';
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
	constructor(
	    @Inject('rethinkDB') private readonly rethinkDB,
  	) { }

	onModuleInit() {
		r.dbCreate('salesDASH').run(this.rethinkDB)
	    .then((result) => {
	    	r.db('salesDASH').tableCreate('invoices', { primaryKey: 'docNumber'} ).run(this.rethinkDB);
 		    r.db('salesDASH').tableCreate('invoiceTotals', { primaryKey: 'monthYear'} ).run(this.rethinkDB);
 		    r.db('salesDASH').tableCreate('dash', {primaryKey: 'field'}).run(this.rethinkDB);
 		    r.db('salesDASH').tableCreate('customers', {primaryKey: 'Customer'}).run(this.rethinkDB);
	 	}).catch((err) =>{

	 	})

	}
}