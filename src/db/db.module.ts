import { Module, Inject } from '@nestjs/common';
import * as r from 'rethinkdb';

const dbProvider = {
  provide: 'rethinkDB',
  useValue: r.connect({ host: 'localhost', port: 28015, db: 'salesDASH' }),
};

@Module({
  components: [dbProvider],
  exports: [dbProvider],
})

export class DBModule { 	
	constructor( 
	    @Inject('rethinkDB') private readonly rethinkDB, 
  	) { 
		r.dbCreate('salesDASH').run(this.rethinkDB)
	    .then((result) => {
	       console.info(JSON.stringify(result, null, 2)); 
	    }).catch(function(err) {
	        console.info(JSON.stringify(err, null, 2));
	    })
	}
}