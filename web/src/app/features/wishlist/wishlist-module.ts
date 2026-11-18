import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared-module';
import { Wishlist } from './wishlist/wishlist';

const routes: Routes = [{ path: '', component: Wishlist }];

@NgModule({
  declarations: [Wishlist],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class WishlistModule {}
