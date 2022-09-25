import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WilayahPage } from './wilayah.page';

const routes: Routes = [
  {
    path: '',
    component: WilayahPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WilayahPageRoutingModule {}
