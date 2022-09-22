import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Kategori } from '../beranda/beranda.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PermintaanService } from '../permintaan/permintaan.service';
import { environment } from 'environments/environment';
import { LoadingController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ulasan',
  templateUrl: './ulasan.page.html'
})
export class UlasanPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  idPermintaan;
  isLoading = true;

  permintaan;

  toast;

  peringkat;
  ulasan;

  constructor(
    private _route: ActivatedRoute,
    private _navCtrl: NavController,
    private _permintaan: PermintaanService,
    private _toast: ToastController,
    private _loading: LoadingController
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.idPermintaan = params.id;
      })
  }

  ionViewDidEnter() {
    this.ambilPermintaan()
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ambilPermintaan(refresher?, loading = true, hanyattd = false) {
    this.isLoading = loading;
    this._permintaan.detail(this.idPermintaan)
      .subscribe(res => {
        console.log(res)
        this.isLoading = false;
        if (refresher) refresher.target.complete();
        if (res.permintaan) this.prosesPermintaan(res.permintaan)
      }, err => {
        if (refresher) refresher.target.complete();
        this.showMsg(err)
      })
  }

  prosesPermintaan(permintaan) {
    this.permintaan = permintaan

    this.peringkat = permintaan.peringkat;
    this.ulasan = permintaan.ulasan;
  }

  async showMsg(err, msg = 'Gagal memuat data permintaan. Coba beberapa saat lagi', color = 'danger') {
    //console.log(err)
    this.isLoading = false;

    if (this.toast) this.toast.dismiss();
    this.toast = await this._toast.create({
      message: msg,
      duration: 3000,
      color,
      mode: 'ios',
      buttons: [{ icon: 'close' }]
    });
    this.toast.present();
  }


  async kirim(){
    let loading = await this._loading.create({
      message: 'Mengirim ulasan anda...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000
    })
    loading.present();
    this._permintaan.ulasan(this.idPermintaan, this.peringkat, this.ulasan)
    .subscribe(res => {
      console.log(res)
      loading.dismiss();
      if(res) {
        this.showMsg(null, 'Berhasil mengirim ulasan.', 'success');
        this._navCtrl.back();
      } else {
        this.showMsg(null, 'Gagal mengirim ulasan. Coba lagi.', 'danger')
      }
    }, err => {
      console.log(err)
      loading.dismiss();
      this.showMsg(null, 'Gagal mengirim ulasan. Coba lagi.', 'danger')
    })
  }
}
