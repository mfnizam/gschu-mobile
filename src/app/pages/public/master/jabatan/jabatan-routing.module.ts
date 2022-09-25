import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JabatanPage } from './jabatan.page';

const routes: Routes = [
  {
    path: '',
    component: JabatanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JabatanPageRoutingModule {}
