import { AccountsService } from "./modules/accounting/services/accounts.service";
import { Repository } from "typeorm";

describe("AccountsService", () => {
  let service: AccountsService;
  let repo: jest.Mocked<Repository<any>>;

  beforeEach(() => {
    repo = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => (Array.isArray(x) ? x.map((i, idx) => ({ ...i, id: `id-${idx}` })) : { ...x, id: "id-1" })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
    } as any;
    service = new AccountsService(repo as any);
  });

  it("seeds default chart of accounts when empty", async () => {
    await service.seedForTenant("tenant-1");
    expect(repo.save).toHaveBeenCalled();
  });

  it("does not seed when accounts exist", async () => {
    repo.count.mockResolvedValue(5);
    await service.seedForTenant("tenant-1");
    expect(repo.save).not.toHaveBeenCalled();
  });
});
