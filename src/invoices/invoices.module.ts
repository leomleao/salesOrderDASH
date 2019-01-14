import { Module, Inject } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [InvoicesController],
  providers: [
      InvoicesService,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {
	constructor( 
	    @Inject('rethinkDB') private readonly rethinkDB, 
  	) { 
		r.db('salesDASH').tableCreate('invoices', { primaryKey: 'docNumber'} ).run(this.rethinkDB)
		// r.db('salesDASH').tableCreate('invoices').run(this.rethinkDB)
	    .then((result) => {
	       console.info(JSON.stringify(result, null, 2)); 
	    }).catch(function(err) {
	        console.info(JSON.stringify(err, null, 2));
	    });

	    r.db('salesDASH').tableCreate('invoiceTotals', { primaryKey: 'monthYear'} ).run(this.rethinkDB)
		// r.db('salesDASH').tableCreate('invoices').run(this.rethinkDB)
	    .then((result) => {
	       console.info(JSON.stringify(result, null, 2)); 
	    }).catch(function(err) {
	        console.info(JSON.stringify(err, null, 2));
	    });
	}
}
