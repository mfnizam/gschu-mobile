import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WilayahPageRoutingModule } from './wilayah-routing.module';

import { WilayahPage } from './wilayah.page';
import { MasterLoadingModule } from 'app/shared/loading/master/master.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    WilayahPageRoutingModule,
    MasterLoadingModule
  ],
  declarations: [WilayahPage]
})
export class WilayahPageModule {}
