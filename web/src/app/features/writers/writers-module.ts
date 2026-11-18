import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared-module';
import { WriterList } from './writer-list/writer-list';
import { WriterDetail } from './writer-detail/writer-detail';

const routes: Routes = [
  { path: '', component: WriterList },
  { path: ':id', component: WriterDetail },
];

@NgModule({
  declarations: [WriterList, WriterDetail],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class WritersModule {}
