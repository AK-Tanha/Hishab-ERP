import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { Unit } from "./entities/unit.entity";
import { Product } from "./entities/product.entity";
import { Warehouse } from "./entities/warehouse.entity";
import { StockMovement } from "./entities/stock-movement.entity";
import { CategoriesService } from "./services/categories.service";
import { CategoriesController } from "./controllers/categories.controller";
import { UnitsService } from "./services/units.service";
import { UnitsController } from "./controllers/units.controller";
import { ProductsService } from "./services/products.service";
import { ProductsController } from "./controllers/products.controller";
import { WarehousesService } from "./services/warehouses.service";
import { WarehousesController } from "./controllers/warehouses.controller";
import { StockService } from "./services/stock.service";
import { StockController } from "./controllers/stock.controller";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Unit, Product, Warehouse, StockMovement]),
    CommonModule,
  ],
  controllers: [CategoriesController, UnitsController, ProductsController, WarehousesController, StockController],
  providers: [CategoriesService, UnitsService, ProductsService, WarehousesService, StockService],
  exports: [ProductsService, StockService, WarehousesService],
})
export class InventoryModule {}
