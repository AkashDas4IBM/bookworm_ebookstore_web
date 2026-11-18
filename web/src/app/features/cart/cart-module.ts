import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { CartRoutingModule } from './cart-routing-module';
import { Basket } from './basket/basket';

@NgModule({
  declarations: [
    Basket
  ],
  imports: [CommonModule, SharedModule, CartRoutingModule],
})
export class CartModule {}
