import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryList } from './category-list/category-list';
import { BrandList } from './brand-list/brand-list';
import { ProductList } from './product-list/product-list';
import { ProductDetail } from './product-detail/product-detail';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'categories' },
  { path: 'categories', component: CategoryList },
  { path: 'categories/:categoryId/brands', component: BrandList },
  { path: 'products', component: ProductList },
  { path: 'products/:id', component: ProductDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogueRoutingModule {}
