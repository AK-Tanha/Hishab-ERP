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

  // Find-or-create the demo tenant so seeding also works when a tenant was
  // already created through the signup flow (seed used to bail out here).
  let tenant = await tenantRepo.findOne({ where: { subdomain: "demo" } });
  if (!tenant) {
    tenant = await tenantRepo.save(
      tenantRepo.create({
        nameEn: "Demo Traders",
        nameBn: "ডেমো ট্রেডার্স",
        subdomain: "demo",
        plan: "starter",
        fiscalYearStartMonth: 7,
        isActive: true,
      }),
    );
  } else {
    console.log("Demo tenant already exists, filling in missing seed data.");
  }
  const T = tenant.id;

  const passwordHash = await bcrypt.hash("password123", 12);

  // Create users for all roles (skip emails that already exist)
  const usersData = [
    { email: "owner@demo.com", nameEn: "Demo Owner", nameBn: "ডেমো মালিক", role: "owner" },
    { email: "admin@demo.com", nameEn: "Admin User", nameBn: "অ্যাডমিন ব্যবহারকারী", role: "admin" },
    { email: "accountant@demo.com", nameEn: "Accountant", nameBn: "হিসাবরক্ষক", role: "accountant" },
    { email: "sales@demo.com", nameEn: "Sales Person", nameBn: "বিক্রয় কর্মী", role: "sales" },
    { email: "storekeeper@demo.com", nameEn: "Storekeeper", nameBn: "গুদাম কর্মচারী", role: "storekeeper" },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (existing) continue;
    const user = userRepo.create({
      tenantId: T,
      email: u.email,
      phone: "01700000000",
      passwordHash,
      nameEn: u.nameEn,
      nameBn: u.nameBn,
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    createdUsers.push({ user: await userRepo.save(user), role: u.role });
  }

  // Existing tenant user (e.g. from signup) is the default createdBy
  const savedUser =
    createdUsers[0]?.user ?? (await userRepo.findOne({ where: { tenantId: T } }));
  if (!savedUser) {
    console.log("No user found for demo tenant, skipping seed.");
    await AppDataSource.destroy();
    return;
  }

  const perms = [
    { code: "users.manage", nameEn: "Manage Users", nameBn: "ব্যবহারকারী পরিচালনা", module: "users", action: "manage" },
    { code: "roles.manage", nameEn: "Manage Roles", nameBn: "ভূমিকা পরিচালনা", module: "roles", action: "manage" },
    { code: "tenants.settings", nameEn: "Tenant Settings", nameBn: "টেনেন্ট সেটিংস", module: "tenants", action: "settings" },
    { code: "inventory.*", nameEn: "All Inventory", nameBn: "সকল ইনভেন্টরি", module: "inventory", action: "*" },
    { code: "sales.*", nameEn: "All Sales", nameBn: "সকল সেলস", module: "sales", action: "*" },
    { code: "purchases.*", nameEn: "All Purchases", nameBn: "সকল ক্রয়", module: "purchases", action: "*" },
    { code: "accounting.*", nameEn: "All Accounting", nameBn: "সকল অ্যাকাউন্টিং", module: "accounting", action: "*" },
    { code: "reports.*", nameEn: "All Reports", nameBn: "সকল রিপোর্ট", module: "reports", action: "*" },
    { code: "sales.invoice.view", nameEn: "View Sales Invoice", nameBn: "বিক্রয় চালান দেখুন", module: "sales", action: "view" },
    { code: "sales.payment.*", nameEn: "Sales Payments", nameBn: "বিক্রয় পেমেন্ট", module: "sales", action: "*" },
    { code: "purchases.bill.view", nameEn: "View Purchase Bill", nameBn: "ক্রয় বিল দেখুন", module: "purchases", action: "view" },
    { code: "inventory.product.view", nameEn: "View Products", nameBn: "পণ্য দেখুন", module: "inventory", action: "view" },
    { code: "stock.adjustment", nameEn: "Stock Adjustment", nameBn: "স্টক সমন্বয়", module: "inventory", action: "adjustment" },
    { code: "reports.sales.view", nameEn: "View Sales Reports", nameBn: "বিক্রয় রিপোর্ট দেখুন", module: "reports", action: "view" },
    { code: "customers.*", nameEn: "All Customers", nameBn: "সকল গ্রাহক", module: "customers", action: "*" },
    { code: "products.view", nameEn: "View Products", nameBn: "পণ্য দেখুন", module: "products", action: "view" },
  ];
  const savedPerms: any[] = [];
  for (const p of perms) {
    const existing = await permRepo.findOne({ where: { code: p.code } });
    savedPerms.push(existing ?? (await permRepo.save(permRepo.create(p))));
  }

  const roles = [
    { code: "owner", nameEn: "Owner", nameBn: "মালিক", isSystem: true, tenantId: T },
    { code: "admin", nameEn: "Admin", nameBn: "অ্যাডমিন", isSystem: true, tenantId: T },
    { code: "accountant", nameEn: "Accountant", nameBn: "হিসাবরক্ষক", isSystem: true, tenantId: T },
    { code: "sales", nameEn: "Sales", nameBn: "বিক্রয়", isSystem: true, tenantId: T },
    { code: "storekeeper", nameEn: "Storekeeper", nameBn: "গুদাম কর্মচারী", isSystem: true, tenantId: T },
  ];
  const savedRoles: any[] = [];
  for (const r of roles) {
    const existing = await roleRepo.findOne({ where: { tenantId: T, code: r.code } });
    savedRoles.push(existing ?? (await roleRepo.save(roleRepo.create(r))));
  }

  const { ROLE_PERMISSIONS } = await import("@hishab/shared");
  for (const cu of createdUsers) {
    const role = savedRoles.find((r: any) => r.code === cu.role);
    if (!role) continue;
    const rolePerms = ROLE_PERMISSIONS[cu.role as keyof typeof ROLE_PERMISSIONS] || [];
    const codes = rolePerms.includes("*") ? savedPerms.map((p: any) => p.code) : rolePerms;
    for (const rp of codes) {
      const perm = savedPerms.find((p: any) => p.code === rp);
      if (!perm) continue;
      const link = await rolePermRepo.findOne({ where: { roleId: role.id, permissionId: perm.id } });
      if (!link) await rolePermRepo.save(rolePermRepo.create({ roleId: role.id, permissionId: perm.id }));
    }
    const userRole = await userRoleRepo.findOne({ where: { userId: cu.user.id, roleId: role.id } });
    if (!userRole) {
      await userRoleRepo.save(userRoleRepo.create({ userId: cu.user.id, roleId: role.id, assignedAt: new Date() }));
    }
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
  let categories = await categoryRepo.find({ where: { tenantId: T } });
  if (categories.length === 0) {
    const catDefs = ["Electronics", "Grocery", "Clothing", "Stationery", "Hardware"];
    categories = await categoryRepo.save(catDefs.map((n) => categoryRepo.create({ tenantId: T, nameEn: n, nameBn: n, isActive: true })));
  }

  // Warehouses
  let warehouses = await warehouseRepo.find({ where: { tenantId: T } });
  if (warehouses.length === 0) {
    const whDefs = ["Main Warehouse", "Secondary"];
    warehouses = await warehouseRepo.save(whDefs.map((n, i) => warehouseRepo.create({ tenantId: T, nameEn: n, nameBn: n, isDefault: i === 0, isActive: true })));
  }
  const mainWh = warehouses.find((w: any) => w.isDefault) ?? warehouses[0];

  // Products (20) + initial stock
  let products = await productRepo.find({ where: { tenantId: T } });
  if (products.length === 0) {
    const productNames = ["Widget", "Gadget", "Thingamajig", "Doohickey", "Whatchamacallit", "Gizmo", "Contraption", "Apparatus", "Instrument", "Device", "Machine", "Tool", "Kit", "Set", "Pack", "Bundle", "Combo", "Unit", "Item", "Product"];
    const created = [];
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
      created.push(await productRepo.save(p));
    }
    products = created;

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
  }

  // Customers (20)
  let customers = await customerRepo.find({ where: { tenantId: T } });
  if (customers.length === 0) {
    const created = [];
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
      created.push(await customerRepo.save(c));
    }
    customers = created;
  }

  // Suppliers (20)
  let suppliers = await supplierRepo.find({ where: { tenantId: T } });
  if (suppliers.length === 0) {
    const created = [];
    for (let i = 0; i < 20; i++) {
      const s = supplierRepo.create({
        tenantId: T,
        nameEn: `Supplier ${i + 1}`,
        nameBn: `সরবরাহকারী ${i + 1}`,
        phone: `018${String(10000000 + i)}`,
        email: `supplier${i + 1}@example.com`,
        address: "Chittagong, Bangladesh",
        isActive: true,
      });
      created.push(await supplierRepo.save(s));
    }
    suppliers = created;
  }

  // Accounts (COA) — skipped when the app already auto-created one for the tenant
  if ((await accountRepo.count({ where: { tenantId: T } })) === 0) {
    const accountDefs = [
      { code: "1110", nameEn: "Cash", nameBn: "নগদ", type: "asset" },
      { code: "1130", nameEn: "Accounts Receivable", nameBn: "প্রাপ্য হিসাব", type: "asset" },
      { code: "1140", nameEn: "Inventory", nameBn: "ইনভেন্টরি", type: "asset" },
      { code: "2110", nameEn: "Accounts Payable", nameBn: "প্রদেয় হিসাব", type: "liability" },
      { code: "2120", nameEn: "VAT Payable", nameBn: "ভ্যাট প্রদেয়", type: "liability" },
      { code: "4100", nameEn: "Sales Revenue", nameBn: "বিক্রয় আয়", type: "income" },
      { code: "5100", nameEn: "Cost of Goods Sold", nameBn: "বিক্রিত পণ্যের খরচ", type: "expense" },
    ];
    for (const a of accountDefs) {
      await accountRepo.save(accountRepo.create({ tenantId: T, code: a.code, nameEn: a.nameEn, nameBn: a.nameBn, type: a.type, isSystem: true, isActive: true }));
    }
  }

  // Invoices (20)
  if ((await invoiceRepo.count({ where: { tenantId: T } })) === 0 && products.length > 0 && customers.length > 0) {
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
  }

  // Bills (20)
  if ((await billRepo.count({ where: { tenantId: T } })) === 0 && products.length > 0 && suppliers.length > 0) {
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
  }

  const counts = {
    users: await userRepo.count({ where: { tenantId: T } }),
    products: await productRepo.count({ where: { tenantId: T } }),
    customers: await customerRepo.count({ where: { tenantId: T } }),
    suppliers: await supplierRepo.count({ where: { tenantId: T } }),
    invoices: await invoiceRepo.count({ where: { tenantId: T } }),
    bills: await billRepo.count({ where: { tenantId: T } }),
  };
  console.log("Seed complete:", counts);
  console.log("Demo tenant:", T);
  console.log("Logins: owner@demo.com, admin@demo.com, accountant@demo.com, sales@demo.com, storekeeper@demo.com / password123");

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
