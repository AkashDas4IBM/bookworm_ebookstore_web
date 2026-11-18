import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { CatalogueRoutingModule } from './catalogue-routing-module';
import { CategoryList } from './category-list/category-list';
import { BrandList } from './brand-list/brand-list';
import { ProductList } from './product-list/product-list';
import { ProductDetail } from './product-detail/product-detail';
import { RelatedProducts } from './related-products/related-products';

@NgModule({
  declarations: [
    CategoryList,
    BrandList,
    ProductList,
    ProductDetail,
    RelatedProducts
  ],
  imports: [CommonModule, SharedModule, CatalogueRoutingModule],
})
export class CatalogueModule {}
