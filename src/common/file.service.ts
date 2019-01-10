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
	        if (filename.indexOf(filter)>=0) {
	        	foundFiles.push( { type: filename.substring(filename.indexOf('BR_DB') + 6, filename.indexOf(',')), path: filename } )
	            console.log('-- found: ', filename);
	        };
		}
		return foundFiles;
    }
}