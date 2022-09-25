import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JabatanPageRoutingModule } from './jabatan-routing.module';

import { JabatanPage } from './jabatan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JabatanPageRoutingModule
  ],
  declarations: [JabatanPage]
})
export class JabatanPageModule {}
