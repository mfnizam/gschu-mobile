import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { User, UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BerandaService, Kategori } from '../beranda/beranda.service';
import { PersetujuanService } from '../persetujuan/persetujuan.service';
import { PermintaanService } from '../permintaan/permintaan.service';
/* 
  TODO:
    - optimasi halaman detail
      - transisi tidak smooth ketika meninggalkan halaman dalam keadaan loading
        solusi:
        - hapus class "skeleton" pada ionViewWillLeave
*/

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html'
})
export class DetailPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  user: User = {} as User;

  idPermintaan;
  jenisPermintaan;
  permintaan/* : Permintaan */;

  isLoading = true;
  toast;

  kategori: Kategori = {} as Kategori;
  catatanTolak;
  tolakLoading = false;

  constructor(
    private _route: ActivatedRoute,
    private _user: UserService,
    private _permintaan: PermintaanService,
    private _persetujuan: PersetujuanService,
    private _beranda: BerandaService,
    private _toast: ToastController,
    private _loading: LoadingController,
    private _alert: AlertController
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.idPermintaan = params.id;
        this.jenisPermintaan = params.jenis;
      })

    this._user.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        this.user = user;
      })
  }

  ionViewDidEnter() {
    this.ambilPermintaan();
    let skeleton = document.getElementById('loading-detail');
    if (skeleton) skeleton.classList.add('skeleton')
  }

  ambilPermintaan(refresher?, loading = true, hanyattd = false) {
    this.isLoading = loading;
    if (this.jenisPermintaan == 'permintaan') {
      this._permintaan.detail(this.idPermintaan)
        .subscribe(res => {
          console.log(res)
          this.isLoading = false;
          if (refresher) refresher.target.complete();
          if (res.permintaan) this.prosesPermintaan(res.permintaan, hanyattd)
        }, err => {
          if (refresher) refresher.target.complete();
          this.showMsg(err)
        })
    } else if (this.jenisPermintaan == 'persetujuan') {
      this._persetujuan.detail(this.idPermintaan)
        .subscribe(res => {
          console.log(res)
          this.isLoading = false;
          if (refresher) refresher.target.complete();
          if (res.permintaan) this.prosesPermintaan(res.permintaan, hanyattd)
        }, err => {
          if (refresher) refresher.target.complete();
          this.showMsg(err)
        })
    }
  }

  prosesPermintaan(permintaan, hanyattd) {
    if (!hanyattd || !this.permintaan) {
      this.permintaan = permintaan
      // this.permintaan.nama = this._beranda._kategori.find(v => v.kode == permintaan?.kategori)?.nama;

      // this.permintaan.user['inisial'] = this.getInitial(permintaan.user.namaLengkap);
      if (this.permintaan.user.foto) this.permintaan.user['foto'] = permintaan.user.foto;
    } else {
      this.permintaan.diketahui = permintaan.diketahui
      this.permintaan.disetujui = permintaan.disetujui
      this.permintaan.selesai = permintaan.selesai
    }

    this.permintaan.status = this._permintaan.setStatus(permintaan)

    // let diketahui = this.permintaan.diketahui
    // if (diketahui?.oleh) diketahui.oleh['inisial'] = this.getInitial(diketahui.oleh.namaLengkap)
    // if (diketahui?.oleh?.foto) diketahui.oleh['foto'] = diketahui.oleh.foto;

    // let disetujui = this.permintaan.disetujui
    // if (disetujui?.oleh) disetujui.oleh['inisial'] = this.getInitial(disetujui.oleh.namaLengkap)
    // if (disetujui?.oleh?.foto) disetujui.oleh['foto'] = disetujui.oleh.foto;

    
    // if (this.permintaan.kategori == 'snack') {
    //   let perihal = this.permintaan.permintaan.perihal
    //   this.permintaan.permintaan.perihal = perihal.length > 2 ? perihal.slice(0, -1).join(', ') + ' & ' + perihal.slice(-1) : perihal.join(' & ');
    // }
  }

  // getInitial(nama) {
  //   return nama.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
  // }

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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async tolak(modal) {
    if (!this.catatanTolak) return this.showMsg(null, 'Harap isi catatan', 'danger')
    let loading = await this._loading.create({
      message: 'Memproses penolakan permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000
    })
    modal.dismiss();
    loading.present();

    this._persetujuan.tolak(this.idPermintaan, this.catatanTolak)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        if (!res) return this.showMsg(null, 'Gagal menolak permintaan. Coba beberapa saat lagi.')
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menolak permintaan.', 'success')
      }, err => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(err, 'Gagal menolak permintaan. Coba beberapa saat lagi.')
      })
  }

  async setuju(modal) {
    let loading = await this._loading.create({
      message: 'Memproses persetujuan permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000
    })
    modal.dismiss();
    loading.present();

    this._persetujuan.setuju(this.idPermintaan)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        if (!res) return this.showMsg(null, 'Gagal menyetujui permintaan. Coba beberapa saat lagi.')
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menyetujui permintaan.', 'success')
      }, err => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(err, 'Gagal menyetujui permintaan. Coba beberapa saat lagi.')
      })
  }

  async selesai(id) {
    let alert = await this._alert.create({
      header: 'Konfirmasi Permintaan Telah Diselesaikan',
      mode: 'ios',
      cssClass: 'item-' + this.permintaan.kategori.kode,
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Selesai', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;

    let loading = await this._loading.create({
      message: 'Memproses penyelesaian permintaan. Mohon tunggu...',
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
        if (!res) return this.showMsg(null, 'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.')
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menyelesaikan permintaan.', 'success')
      }, err => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(err, 'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.')
      })
  }
}
