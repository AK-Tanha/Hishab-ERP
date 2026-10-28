import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { JournalEntry } from "./entities/journal-entry.entity";
import { JournalLine } from "./entities/journal-line.entity";
import { AccountsService } from "./services/accounts.service";
import { AccountsController } from "./controllers/accounts.controller";
import { JournalService } from "./services/journal.service";
import { JournalController } from "./controllers/journal.controller";
import { LedgerService } from "./services/ledger.service";
import { LedgerController } from "./controllers/ledger.controller";
import { TrialBalanceService } from "./services/trial-balance.service";
import { TrialBalanceController } from "./controllers/trial-balance.controller";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [TypeOrmModule.forFeature([Account, JournalEntry, JournalLine]), CommonModule],
  controllers: [AccountsController, JournalController, LedgerController, TrialBalanceController],
  providers: [AccountsService, JournalService, LedgerService, TrialBalanceService],
  exports: [AccountsService, JournalService, LedgerService, TrialBalanceService],
})
export class AccountingModule {}
