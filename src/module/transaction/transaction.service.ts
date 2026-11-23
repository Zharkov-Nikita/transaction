import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GetTransactionsFilterDto } from './dto/get-transactions-filter.dto';
import { InternalAccountService } from '../../internal/account/account.service';
import { KafkaService } from '../../config/kafka/kafka.service';
import {
  BalanceChanedStatus,
  EventBalanceChangedData,
  EventNameEnum,
  EventTransactionSavedData,
  TransactionStatus,
  TransactionType,
} from './transaction.types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly internalAccountService: InternalAccountService,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(params: CreateTransactionDto): Promise<void> {
    const { userId, amount, transactionType, recipient } = params;

    if (transactionType == TransactionType.TRANSFER && recipient) {
      return this.createTransferTransaction(params);
    }

    const transaction = await this.transactionRepository.createTransaction({
      userId,
      amount,
      type: transactionType,
    });

    const data: EventTransactionSavedData = {
      userId,
      amount,
      transactionId: transaction.id,
      transactionType,
    };

    this.kafkaService.produce({ eventName: EventNameEnum.TransactionSaved, data });
  }

  async createTransferTransaction(params: CreateTransactionDto): Promise<void> {
    const { userId, amount, transactionType, recipient } = params;

    if (!recipient) {
      throw new Error('Recipient is required for transfer');
    }

    const transactionWithdrawl = await this.transactionRepository.createTransaction({
      userId,
      amount: '-' + amount,
      type: transactionType,
    });

    const dataWithdrawl: EventTransactionSavedData = {
      userId,
      amount,
      transactionId: transactionWithdrawl.id,
      transactionType: TransactionType.WITHDRAWL,
    };

    this.kafkaService.produce({ eventName: EventNameEnum.TransactionSaved,
      data: dataWithdrawl });

    const transactionDeposit = await this.transactionRepository.createTransaction({
      userId: recipient,
      amount: amount,
      type: transactionType,
    });

    const dataDeposit: EventTransactionSavedData = {
      userId: recipient,
      amount,
      transactionId: transactionDeposit.id,
      transactionType: TransactionType.DEPOSIT,
    };

    this.kafkaService.produce({ eventName: EventNameEnum.TransactionSaved,
      data: dataDeposit });
  }

  async updateStatus(params: EventBalanceChangedData): Promise<void> {
    const { transactionId, status } = params;

    let transactionStatus = TransactionStatus.COMPLETED;
    if (status == BalanceChanedStatus.FAILED) {
      transactionStatus = TransactionStatus.FAILED;
    }

    await this.transactionRepository.updateStatus(transactionId, transactionStatus);
  }

  async getTransaction(id: string): Promise<TransactionDto> {
    return this.transactionRepository.findById(id);
  }

  async getTransactions(params: GetTransactionsFilterDto): Promise<{ items:
    TransactionDto[]; total: number }> {
    return this.transactionRepository.findByParams(params);
  }
}