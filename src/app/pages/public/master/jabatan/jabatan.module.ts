import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JabatanPageRoutingModule } from './jabatan-routing.module';

import { JabatanPage } from './jabatan.page';
import { MasterLoadingComponent } from 'app/shared/loading/master/master.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    JabatanPageRoutingModule
  ],
  declarations: [JabatanPage, MasterLoadingComponent]
})
export class JabatanPageModule {}
