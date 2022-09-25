import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FungsiPageRoutingModule } from './fungsi-routing.module';

import { FungsiPage } from './fungsi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FungsiPageRoutingModule
  ],
  declarations: [FungsiPage]
})
export class FungsiPageModule {}
