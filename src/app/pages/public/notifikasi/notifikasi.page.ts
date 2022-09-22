import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NotifikasiService } from './notifikasi.service';

@Component({
  selector: 'app-notifikasi',
  templateUrl: './notifikasi.page.html'
})
export class NotifikasiPage {

  notifikasi = [];

  isLoading = true;

  constructor(
    private _notifikasi: NotifikasiService,
    private _navCtrl: NavController
  ) {}
  
  ionViewDidEnter(){
    this.ambilNotifikasi(null, this.notifikasi.length < 1);
    let skeleton = document.getElementById('loading-permintaan');
    if(skeleton) skeleton.classList.add('skeleton')
  }

  ambilNotifikasi(refresher = null, isLoading = true){
    this.isLoading = isLoading;
    this._notifikasi.notifikasi()
    .subscribe(res => {
      console.log(res);
      this.isLoading = false;
      if(refresher) refresher.target.complete();
      this.notifikasi = res.notifikasi;
    }, err => {
      console.log(err)
      this.isLoading = false;
      if(refresher) refresher.target.complete();
    })
  }

  detail(not){
    not.dibaca = true;
    console.log(not.dibaca)
    this._navCtrl.navigateForward('/notifikasi/' + not._id)
  }
}
