import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivasiPage } from './privasi.page';

const routes: Routes = [
  {
    path: '',
    component: PrivasiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivasiPageRoutingModule {}
