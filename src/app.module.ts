import { Module, Inject } from '@nestjs/common';
import { DashModule } from './dash/dash.module';
import { SalesOrdersModule } from './salesorders/salesorders.module';
import { ConfigModule } from "nestjs-config";
import { ScheduleService } from './common/schedule.service'
import { FileService } from './common/file.service'

import * as r from 'rethinkdb';
import * as path from 'path';

@Module({
	imports: [
        ConfigModule.load(path.resolve(__dirname, 'config/**/*.{ts,js}')),
        SalesOrdersModule
    ],
    modules: [DashModule, SalesOrdersModule],
    providers: [ ScheduleService, FileService],
})

export class AppModule {   
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