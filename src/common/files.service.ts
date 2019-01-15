import { Injectable, Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {

    async findNewFiles(folderPath, filter){

	    if (!fs.existsSync(folderPath)){
	        return;
	    }
	    const foundFiles = [];
    	const files = fs.readdirSync(folderPath);

	    for (const file of files){
	        const filename = path.join(folderPath, file);
	        const stat = fs.lstatSync(filename);

	        if (filename.indexOf(filter) >= 0) {
	        	if (filename.indexOf('TREATED') < 0 && filename.indexOf('Job BR_DB') >= 0) {
		        	const type = filename.substring(filename.indexOf('Job BR_DB') + 10, filename.indexOf(','));
		        	const newFileName = filename.replace(filename.substring(filename.indexOf('Job BR_DB') + 10, filename.indexOf(',')), type + 'TREATED');

		        	fs.renameSync(filename, newFileName);
				       foundFiles.push( { type, path: newFileName } );
	        	}
	        }
		}

		   return foundFiles;
    }
}