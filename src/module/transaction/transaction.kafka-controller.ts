import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';
import { EventNameEnum } from './transaction.types';
import type { EventBalanceChangedData } from './transaction.types';

@Controller()
export class TransactionKafkaController {
  constructor(private readonly transactionService: TransactionService) {}

  @EventPattern(EventNameEnum.BalanceChanged)
  async handletransactionSaved(@Payload() message: EventBalanceChangedData):
Promise<void> {
    await this.transactionService.updateStatus(message);
  }
}