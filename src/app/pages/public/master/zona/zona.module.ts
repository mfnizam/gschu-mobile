import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ZonaPageRoutingModule } from './zona-routing.module';

import { ZonaPage } from './zona.page';
import { MasterLoadingModule } from 'app/shared/loading/master/master.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ZonaPageRoutingModule,
    MasterLoadingModule
  ],
  declarations: [ZonaPage]
})
export class ZonaPageModule {}
