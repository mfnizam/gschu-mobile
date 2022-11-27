import { Component, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { User, UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BerandaService } from '../beranda/beranda.service';
import { PermintaanService } from '../permintaan/permintaan.service';
import { PersetujuanService } from './persetujuan.service';

@Component({
  selector: 'app-persetujuan',
  templateUrl: './persetujuan.page.html'
})
export class PersetujuanPage implements OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  segment = 'menunggu';

  user: User;

  permintaan = [];
  totalPermintaan = 0;
  isLoading = true;

  toast;

  constructor(
    private _persetujuan: PersetujuanService,
    private _user: UserService,
    private _beranda: BerandaService,
    private _permintaan: PermintaanService,
    private _loading: LoadingController,
    private _toast: ToastController,
    private _alert: AlertController
  ) {
    this._user.user$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(user => {
      this.user = user;
    })
    // this.ambilPermintaan(null, true);
  }

  ionViewDidEnter(){
    this.ambilPermintaan(null, this.permintaan.length < 1)
    let skeleton = document.getElementById('loading-persetujuan');
    if(skeleton) skeleton.classList.add('skeleton')
  }

  ionViewWillLeave(){
    let skeleton = document.getElementById('loading-persetujuan');
    if(skeleton) skeleton.classList.remove('skeleton')
  }

  segmentChange(event){
    this.ambilPermintaan(null, true)
  }
  
  ambilPermintaan(refresher?, isLoading = false){
    if(!this.user.atasan && !this.user.penyetuju) return;
    
    this.isLoading = isLoading;
    if(isLoading) this.permintaan = [];
    this._persetujuan.persetujuan(this.segment)
    .subscribe(res => {
      console.log(res);
      this.isLoading = false;
      this.permintaan = res.permintaan.map(v => ({ 
        ...v, 
        // jenis: this._beranda._kategori.find(r => r.kode == v.kategori)?.nama,
        user: {
          ...v.user,
          // inisial: v.user.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase(),
        },
        status: this._permintaan.setStatus(v)
      }));
      this.totalPermintaan = res.total;
      if(refresher) refresher.target.complete();
    }, err => {
      console.log(err)
      this.isLoading = false;
      if(refresher) refresher.target.complete();
      this.showMsg(err)
    })
  }
  
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async selesai(id){
    let loading = await this._loading.create({
      message: 'Memproses penolakan permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000
    })
    // modal.dismiss();
    loading.present();

    this._persetujuan.selesai(id)
    .subscribe(res => {
      console.log(res)
      loading.dismiss();
      if(!res) return this.showMsg(null, 'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.')
      this.ambilPermintaan(false);
      this.showMsg(null, 'Berhasil menyelesaikan permintaan.', 'success')
    }, err => {
      loading.dismiss();
      //console.log(err)
      this.showMsg(err, 'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.')
    })
  }

  async openUlasan(ulasan){
    let alert = await this._alert.create({
      header: 'Ulasan Permintaan',
      message: ulasan,
      mode: 'ios',
      buttons: [{ text: 'Tutup', role: 'cancel'}]
    })
    alert.present();
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

}
