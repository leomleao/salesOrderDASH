import { Module, Inject } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [CustomersController],
  providers: [
      CustomersService,
  ],
  exports: [CustomersService],
})
export class CustomersModule {
	constructor( 
	    @Inject('rethinkDB') private readonly rethinkDB, 
  	) { 
		r.db('salesDASH').tableCreate('customers', {primaryKey: 'Customer'}).run(this.rethinkDB)
	    .then((result) => {
	       console.info(JSON.stringify(result, null, 2)); 
	    }).catch(function(err) {
	        console.info(JSON.stringify(err, null, 2));
	    })
	}
}
