import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KategoriPage } from './kategori.page';

const routes: Routes = [
  {
    path: '',
    component: KategoriPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KategoriPageRoutingModule {}
