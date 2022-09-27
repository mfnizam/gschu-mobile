import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WilayahPageRoutingModule } from './wilayah-routing.module';

import { WilayahPage } from './wilayah.page';
import { MasterLoadingComponent } from 'app/shared/loading/master/master.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    WilayahPageRoutingModule
  ],
  declarations: [WilayahPage, MasterLoadingComponent]
})
export class WilayahPageModule {}
