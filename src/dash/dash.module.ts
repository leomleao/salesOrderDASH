import { Module, Inject } from '@nestjs/common';
import { DashController } from './dash.controller';
import { DashService } from './dash.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [DashController],
  providers: [
      DashService,
  ],
  exports: [DashService],
})
export class DashModule {
	constructor( 
	    @Inject('rethinkDB') private readonly rethinkDB, 
  	) { 
		r.tableCreate('dash', {primaryKey: 'field'}).run(this.rethinkDB)
	    .then((result) => {
	       console.info(JSON.stringify(result, null, 2)); 
	    }).catch(function(err) {
	        console.info(JSON.stringify(err, null, 2));
	    })
	} 
}
