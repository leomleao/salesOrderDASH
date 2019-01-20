import { IsNotEmpty } from 'class-validator';

export class QueryParams {
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;

  @IsNotEmpty()
  groupBy: string;
}
