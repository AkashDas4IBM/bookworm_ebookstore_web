import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { OrdersRoutingModule } from './orders-routing-module';
import { OrderHistory } from './order-history/order-history';
import { OrderDetail } from './order-detail/order-detail';

@NgModule({
  declarations: [
    OrderHistory,
    OrderDetail
  ],
  imports: [CommonModule, SharedModule, OrdersRoutingModule],
})
export class OrdersModule {}
