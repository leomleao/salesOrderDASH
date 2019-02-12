import { Module, Inject, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/logging.service';
import * as r from 'rethinkdb';

const dbProvider = {
  provide: 'rethinkDB',
  useValue: r.connect({ host: 'localhost', port: 28015, db: 'salesDASH' }),
};

@Module({
  components: [dbProvider],
  exports: [dbProvider],
})
export class DBModule implements OnModuleInit {
  private readonly logger: LoggerService = new LoggerService(DBModule.name);
  constructor(@Inject('rethinkDB') private readonly rethinkDB) {}

  onModuleInit() {
    r.dbCreate('salesDASH')
      .run(this.rethinkDB)
      .then(result => {})
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('invoices', { primaryKey: 'docNumber' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('invoiceTotals', { primaryKey: 'period' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('goals', { primaryKey: 'period' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('dash', { primaryKey: 'field' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('customers', { primaryKey: 'customer' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('salesOrders', { primaryKey: 'docNumber' })
      .run(this.rethinkDB)
      .catch(err => {});
    r.db('salesDASH')
      .tableCreate('customersDB2', { primaryKey: 'customer' })
      .run(this.rethinkDB)
      .catch(err => {});

    r.db('salesDASH')
      .table('goals')
      .insert([
        {
          period: '1.2019',
          value: 2307000,
        },
        {
          period: '2.2019',
          value: 2655000,
        },
        {
          period: '3.2019',
          value: 3238000,
        },
        {
          period: '4.2019',
          value: 3404000,
        },
        {
          period: '5.2019',
          value: 3024000,
        },
        {
          period: '6.2019',
          value: 3273000,
        },
        {
          period: '7.2019',
          value: 3389000,
        },
        {
          period: '8.2019',
          value: 3908000,
        },
        {
          period: '9.2019',
          value: 3984000,
        },
        {
          period: '10.2019',
          value: 4002000,
        },
        {
          period: '11.2019',
          value: 4019000,
        },
        {
          period: '12.2019',
          value: 3047000,
        },
      ])
      .run(this.rethinkDB)
      .catch(err => {});
  }
}
