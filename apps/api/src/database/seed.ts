import "reflect-metadata";
import { AppDataSource } from "./data-source";
import * as bcrypt from "bcryptjs";

async function main() {
  await AppDataSource.initialize();
  console.log("DB connected");

  const tenantRepo = AppDataSource.getRepository("Tenant");
  const userRepo = AppDataSource.getRepository("User");
  const roleRepo = AppDataSource.getRepository("Role");
  const permRepo = AppDataSource.getRepository("Permission");
  const rolePermRepo = AppDataSource.getRepository("RolePermission");
  const userRoleRepo = AppDataSource.getRepository("UserRole");
  const categoryRepo = AppDataSource.getRepository("Category");
  const unitRepo = AppDataSource.getRepository("Unit");
  const productRepo = AppDataSource.getRepository("Product");
  const warehouseRepo = AppDataSource.getRepository("Warehouse");
  const movementRepo = AppDataSource.getRepository("StockMovement");
  const customerRepo = AppDataSource.getRepository("Customer");
  const supplierRepo = AppDataSource.getRepository("Supplier");
  const accountRepo = AppDataSource.getRepository("Account");
  const invoiceRepo = AppDataSource.getRepository("Invoice");
  const invoiceItemRepo = AppDataSource.getRepository("InvoiceItem");
  const billRepo = AppDataSource.getRepository("Bill");
  const billItemRepo = AppDataSource.getRepository("BillItem");

  const exists = await tenantRepo.findOne({ where: { subdomain: "demo" } });
  if (exists) {
    console.log("Demo tenant already exists, skipping seed.");
    await AppDataSource.destroy();
    return;
  }

  const tenant = tenantRepo.create({
    nameEn: "Demo Traders",
    nameBn: "ডেমো ট্রেডার্স",
    subdomain: "demo",
    plan: "starter",
    fiscalYearStartMonth: 7,
    isActive: true,
  });
  const savedTenant = await tenantRepo.save(tenant);
  const T = savedTenant.id;

  const passwordHash = await bcrypt.hash("password123", 12);
  const user = userRepo.create({
    tenantId: T,
    email: "demo@hishab.local",
    phone: "01700000000",
    passwordHash,
    nameEn: "Demo Owner",
    nameBn: "ডেমো মালিক",
    isActive: true,
    emailVerifiedAt: new Date(),
  });
  const savedUser = await userRepo.save(user);

  const perms = [
    { code: "users.manage", nameEn: "Manage Users", nameBn: "ব্যবহারকারী পরিচালনা", module: "users", action: "manage" },
    { code: "roles.manage", nameEn: "Manage Roles", nameBn: "ভূমিকা পরিচালনা", module: "roles", action: "manage" },
    { code: "tenants.settings", nameEn: "Tenant Settings", nameBn: "টেনেন্ট সেটিংস", module: "tenants", action: "settings" },
    { code: "inventory.*", nameEn: "All Inventory", nameBn: "সকল ইনভেন্টরি", module: "inventory", action: "*" },
    { code: "sales.*", nameEn: "All Sales", nameBn: "সকল সেলস", module: "sales", action: "*" },
    { code: "purchases.*", nameEn: "All Purchases", nameBn: "সকল ক্রয়", module: "purchases", action: "*" },
    { code: "accounting.*", nameEn: "All Accounting", nameBn: "সকল অ্যাকাউন্টিং", module: "accounting", action: "*" },
    { code: "reports.*", nameEn: "All Reports", nameBn: "সকল রিপোর্ট", module: "reports", action: "*" },
  ];
  const savedPerms = await permRepo.save(perms.map((p) => permRepo.create(p)));

  const roles = [
    { code: "owner", nameEn: "Owner", nameBn: "মালিক", isSystem: true, tenantId: T },
    { code: "admin", nameEn: "Admin", nameBn: "অ্যাডমিন", isSystem: true, tenantId: T },
    { code: "accountant", nameEn: "Accountant", nameBn: "অ্যাকাউন্ট্যান্ট", isSystem: true, tenantId: T },
    { code: "sales", nameEn: "Sales", nameBn: "সেলস", isSystem: true, tenantId: T },
    { code: "storekeeper", nameEn: "Storekeeper", nameBn: "স্টোরকিপার", isSystem: true, tenantId: T },
  ];
  const savedRoles = await roleRepo.save(roles.map((r) => roleRepo.create(r)));
  const ownerRole = savedRoles.find((r: any) => r.code === "owner");
  if (ownerRole) {
    await rolePermRepo.save(savedPerms.map((p: any) => rolePermRepo.create({ roleId: ownerRole.id, permissionId: p.id })));
    await userRoleRepo.save(userRoleRepo.create({ userId: savedUser.id, roleId: ownerRole.id, assignedAt: new Date() }));
  }

  // Units (system)
  const unitDefs = [
    { code: "pcs", nameEn: "Pieces", nameBn: "পিস", isSystem: true, tenantId: null },
    { code: "kg", nameEn: "Kilogram", nameBn: "কেজি", isSystem: true, tenantId: null },
    { code: "box", nameEn: "Box", nameBn: "বক্স", isSystem: true, tenantId: null },
  ];
  const existingCount = await unitRepo.count({ where: { isSystem: true } });
  if (existingCount === 0) {
    await unitRepo.save(unitDefs.map((u) => unitRepo.create(u)));
  }
  const pcsUnit = (await unitRepo.findOne({ where: { code: "pcs" } }))!;

  // Categories
  const catDefs = ["Electronics", "Grocery", "Clothing", "Stationery", "Hardware"];
  const categories = await categoryRepo.save(catDefs.map((n) => categoryRepo.create({ tenantId: T, nameEn: n, nameBn: n, isActive: true })));

  // Warehouses
  const whDefs = ["Main Warehouse", "Secondary"];
  const warehouses = await warehouseRepo.save(whDefs.map((n, i) => warehouseRepo.create({ tenantId: T, nameEn: n, nameBn: n, isDefault: i === 0, isActive: true })));
  const mainWh = warehouses[0];

  // Products (20)
  const productNames = ["Widget", "Gadget", "Thingamajig", "Doohickey", "Whatchamacallit", "Gizmo", "Contraption", "Apparatus", "Instrument", "Device", "Machine", "Tool", "Kit", "Set", "Pack", "Bundle", "Combo", "Unit", "Item", "Product"];
  const products = [];
  for (let i = 0; i < 20; i++) {
    const p = productRepo.create({
      tenantId: T,
      sku: `SKU-${String(i + 1).padStart(4, "0")}`,
      nameEn: `${productNames[i % productNames.length]} ${i + 1}`,
      nameBn: `পণ্য ${i + 1}`,
      categoryId: categories[i % categories.length].id,
      unitId: pcsUnit.id,
      costPrice: (500 + i * 100) * 100,
      sellingPrice: (800 + i * 150) * 100,
      reorderLevel: "5",
      hasVariants: false,
      isActive: true,
    });
    products.push(await productRepo.save(p));
  }

  // Stock in 50 each
  for (const p of products) {
    await movementRepo.save(movementRepo.create({
      tenantId: T,
      productId: p.id,
      warehouseId: mainWh.id,
      type: "in",
      quantity: "50",
      notes: "Initial stock",
      createdBy: savedUser.id,
    }));
  }

  // Customers (20)
  const customers = [];
  for (let i = 0; i < 20; i++) {
    const c = customerRepo.create({
      tenantId: T,
      nameEn: `Customer ${i + 1}`,
      nameBn: `গ্রাহক ${i + 1}`,
      phone: `017${String(10000000 + i)}`,
      email: `customer${i + 1}@example.com`,
      address: `Dhaka, Bangladesh`,
      isActive: true,
    });
    customers.push(await customerRepo.save(c));
  }

  // Suppliers (20)
  const suppliers = [];
  for (let i = 0; i < 20; i++) {
    const s = supplierRepo.create({
      tenantId: T,
      nameEn: `Supplier ${i + 1}`,
      nameBn: `সরবরাহকারী ${i + 1}`,
      phone: `018${String(10000000 + i)}`,
      email: `supplier${i + 1}@example.com`,
      address: `Chittagong, Bangladesh`,
      isActive: true,
    });
    suppliers.push(await supplierRepo.save(s));
  }

  // Accounts (seed COA via service-like manual seed) — use a minimal set
  const accountDefs = [
    { code: "1110", nameEn: "Cash", nameBn: "নগদ", type: "asset" },
    { code: "1130", nameEn: "Accounts Receivable", nameBn: "প্রাপ্য হিসাব", type: "asset" },
    { code: "1140", nameEn: "Inventory", nameBn: "ইনভেন্টরি", type: "asset" },
    { code: "2110", nameEn: "Accounts Payable", nameBn: "প্রদেয় হিসাব", type: "liability" },
    { code: "2120", nameEn: "VAT Payable", nameBn: "ভ্যাট প্রদেয়", type: "liability" },
    { code: "4100", nameEn: "Sales Revenue", nameBn: "বিক্রয় আয়", type: "income" },
    { code: "5100", nameEn: "Cost of Goods Sold", nameBn: "বিক্রিত পণ্যের খরচ", type: "expense" },
  ];
  const accountMap: Record<string, string> = {};
  for (const a of accountDefs) {
    const acc = accountRepo.create({ tenantId: T, code: a.code, nameEn: a.nameEn, nameBn: a.nameBn, type: a.type, isSystem: true, isActive: true });
    const saved = await accountRepo.save(acc);
    accountMap[a.code] = saved.id;
  }

  // Invoices (20)
  for (let i = 0; i < 20; i++) {
    const prod = products[i % products.length];
    const cust = customers[i % customers.length];
    const qty = 1 + (i % 5);
    const unitPrice = prod.sellingPrice;
    const subtotal = qty * unitPrice;
    const total = subtotal;
    const paidAmount = i % 3 === 0 ? total : i % 3 === 1 ? Math.round(total / 2) : 0;
    const inv = invoiceRepo.create({
      tenantId: T,
      invoiceNumber: `INV-${String(i + 1).padStart(6, "0")}`,
      customerId: cust.id,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      status: paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : "posted",
      subtotal,
      discount: 0,
      vat: 0,
      total,
      paidAmount,
      createdBy: savedUser.id,
    });
    const savedInv = await invoiceRepo.save(inv);
    await invoiceItemRepo.save(invoiceItemRepo.create({
      tenantId: T,
      invoiceId: savedInv.id,
      productId: prod.id,
      description: prod.nameEn,
      quantity: String(qty),
      unitPrice,
      total: subtotal,
    }));
    // stock out
    await movementRepo.save(movementRepo.create({
      tenantId: T,
      productId: prod.id,
      warehouseId: mainWh.id,
      type: "out",
      quantity: String(qty),
      referenceType: "invoice",
      referenceId: savedInv.id,
      createdBy: savedUser.id,
    }));
  }

  // Bills (20)
  for (let i = 0; i < 20; i++) {
    const prod = products[i % products.length];
    const sup = suppliers[i % suppliers.length];
    const qty = 2 + (i % 4);
    const unitCost = prod.costPrice;
    const subtotal = qty * unitCost;
    const total = subtotal;
    const paidAmount = i % 2 === 0 ? total : 0;
    const bill = billRepo.create({
      tenantId: T,
      billNumber: `BILL-${String(i + 1).padStart(6, "0")}`,
      supplierId: sup.id,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      status: paidAmount >= total ? "paid" : paidAmount > 0 ? "partial" : "posted",
      subtotal,
      vat: 0,
      total,
      paidAmount,
      createdBy: savedUser.id,
    });
    const savedBill = await billRepo.save(bill);
    await billItemRepo.save(billItemRepo.create({
      tenantId: T,
      billId: savedBill.id,
      productId: prod.id,
      description: prod.nameEn,
      quantity: String(qty),
      unitCost,
      total: subtotal,
    }));
    // stock in
    await movementRepo.save(movementRepo.create({
      tenantId: T,
      productId: prod.id,
      warehouseId: mainWh.id,
      type: "in",
      quantity: String(qty),
      referenceType: "bill",
      referenceId: savedBill.id,
      createdBy: savedUser.id,
    }));
  }

  console.log("Seed complete: 20 products, 20 customers, 20 suppliers, 20 invoices, 20 bills");
  console.log("Demo tenant:", T);
  console.log("Login: demo@hishab.local / password123");

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
