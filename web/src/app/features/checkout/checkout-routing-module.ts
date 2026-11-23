import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Checkout } from './checkout/checkout';
import { Payment } from './payment/payment';
import { OrderConfirmation } from './order-confirmation/order-confirmation';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: Checkout },
  { path: 'payment', component: Payment },
  { path: 'confirmation/:id', component: OrderConfirmation },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutRoutingModule {}
