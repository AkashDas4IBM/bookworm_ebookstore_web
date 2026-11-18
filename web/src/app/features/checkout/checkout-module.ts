import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { CheckoutRoutingModule } from './checkout-routing-module';
import { Checkout } from './checkout/checkout';
import { AddressSelect } from './address-select/address-select';
import { Payment } from './payment/payment';
import { GiftPoints } from './gift-points/gift-points';
import { OrderConfirmation } from './order-confirmation/order-confirmation';

@NgModule({
  declarations: [
    Checkout,
    AddressSelect,
    Payment,
    GiftPoints,
    OrderConfirmation
  ],
  imports: [CommonModule, SharedModule, CheckoutRoutingModule],
})
export class CheckoutModule {}
