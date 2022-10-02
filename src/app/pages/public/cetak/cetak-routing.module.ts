import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CetakPage } from './cetak.page';

const routes: Routes = [
  {
    path: '',
    component: CetakPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CetakPageRoutingModule {}
