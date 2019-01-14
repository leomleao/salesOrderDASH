import { Injectable, Inject } from "@nestjs/common";
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {

    async findNewFiles(folderPath, filter){

	    if (!fs.existsSync(folderPath)){
	        console.log("no dir ",folderPath);
	        return;
	    }
	    var foundFiles = [];	    
    	var files = fs.readdirSync(folderPath);

	    for(var i = 0; i < files.length; i++){
	        var filename = path.join(folderPath,files[i]);
	        var stat = fs.lstatSync(filename);

	        console.info("------------------------------------------------------")
	        console.info(filter);
	        console.info("------------------------------------------------------");

	        if (filename.indexOf(filter)>=0) {
	        	if (filename.indexOf("TREATED") < 0 && filename.indexOf('Job BR_DB') >= 0) {
		        	console.info(filename);
		        	const type = filename.substring(filename.indexOf('Job BR_DB') + 10, filename.indexOf(','));
		        	const newFileName = filename.replace(filename.substring(filename.indexOf('Job BR_DB') + 10, filename.indexOf(',')), type + 'TREATED');

		        	fs.renameSync(filename, newFileName);	        	
				    foundFiles.push( { type: type, path: newFileName } )
	            	console.log('-- found: ', filename);

	        	}
	        };	       
		}		
		return foundFiles;
    }
}