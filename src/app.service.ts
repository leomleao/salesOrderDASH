import { Injectable } from '@nestjs/common';
import * as soap from 'soap';

@Injectable()
export class AppService {  
  async totalSalesOrders(){
      const soap = require('soap');
      const url = './src/ws/ecc_salesorder009qr.wsdl';
      let salesOrders = 0;
      const args = { 
        SalesOrderSelectionByElements: { 
          SelectionBySalesOrganisationID: { 
            IntervalBoundaryTypeCode: 1, 
            LowerBoundarySalesOrganisationID:'0022'
          },
          SelectionByCreationDate: {
            IntervalBoundaryTypeCode: 8,
            LowerBoundaryCreationDate: '2018-12-02'
          }
        },
        ProcessingConditions: {
          QueryHitsMaximumNumberValue: 50
        }
      };
      await soap.createClientAsync(url).then((client) => {
        client.setSecurity(new soap.BasicAuthSecurity('u228820', 'cp1205rm28f='));  
        return client.SalesOrderERPBasicDataByElementsQueryResponse_InAsync(args)
      }).then((result) => {
        console.log(result[0].SalesOrder.length);
        salesOrders = result[0].SalesOrder.length
      });
      return salesOrders;
    }  
}