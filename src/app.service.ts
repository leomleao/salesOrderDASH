import { Injectable } from '@nestjs/common';
import * as soap from 'easysoap';

@Injectable()
export class AppService {  
  totalSalesOrders(){
    const opts = { secure : false };
    const params = { 
      host: 'http://axerp0107.wago.local:8010/sap/bc/srt/xip/sap/ecc_salesorder009qr/100/ecc_salesorder009qr/ecc_salesorder009qr',
      path: '../ws/soap.xml',
      wsdl: '../ws/ecc_salesorder009qr.wsdl' 
    };
    const soapClient = soap(params, opts);

    /*
     * get all available functions
     */
    soapClient.getAllFunctions()
       .then((functionArray) => { console.log(functionArray); })
       .catch((err) => { throw new Error(err); });


      return 5;
    }  
}