import { Component, OnDestroy } from '@angular/core';
import { User, UserService } from 'app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermintaanService } from '../permintaan/permintaan.service';
import { BerandaService, Kategori } from './beranda.service';

import { AuthService } from 'app/services/auth/auth.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { StorageService } from 'app/services/storage/storage.service';
import { AkunService } from '../akun/akun.service';

/* 
  TODO:
    - optimasi halaman beranda
    - ketika app dalam multitasking dan kembali tampil, transisinya tidak smooth. pada halaman lain smooth
      kemungkinan penyebab:
      - render kategori dengan ngclass
      - render icon kategori dengan img
      - render permintaan terakhir tanpa trackFn
      - render permintaan icon dengan img
*/

@Component({
  selector: 'app-beranda',
  templateUrl: 'beranda.page.html',
})
export class BerandaPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDesktop = true;

  kategori: Kategori[] = this._beranda._kategori;

  user: User;

  totalNotifikasi = 0;

  menungguPersetujuan = []; // tambahkan interface Permintaan[];
  totalMenungguPersetujuan = 0;
  isMtLoading = true;
  permintaanTerakhir = []; // tambahkan interface Permintaan[];
  totalPermintaanTerakhir = 0;
  isPtLoading = true;

  constructor(
    private _platform: Platform,
    private _navCtrl: NavController,
    private _beranda: BerandaService,
    private _permintaan: PermintaanService,
    private _user: UserService,
    private _auth: AuthService,
    private _storage: StorageService,
    private _akun: AkunService,
    private _alert: AlertController
  ) {
    this.isDesktop = this._platform.platforms().includes('desktop');
    this._user.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        // console.log(user)
        this.user = user;
      })

    // this.ambilKategori();
  }

  ionViewDidEnter() {
    this.ambilBeranda();
    // let spt = document.getElementById('loading-permintan');
    // if (spt) spt.classList.add('skeleton');
    // let smt = document.getElementById('loading-persetujuan');
    // if (smt) smt.classList.add('skeleton')
  }

  refresh(refresher) {
    this._akun.akun()
      .subscribe(res => this.ambilBeranda(refresher), err => this.ambilBeranda(refresher))
  }

  ambilBeranda(refresher?) {
    // TODO: tempatkan data permintaan dan persetujuan pada beranda service sehingga data dapat di update dari halaman lain tanpa perlu memanggih ionviewdidenter
    if (this.permintaanTerakhir?.length < 1) this.isPtLoading = true;
    if (this.menungguPersetujuan?.length < 1 && (this.user.atasan || this.user.penyetuju)) this.isMtLoading = true;
    this._beranda.beranda({ size: 3 }).subscribe(async res => {
      console.log(res)

      // handle notifikasi
      this.totalNotifikasi = Number(res.totalNotifikasi) > 9 ? '9+' : res.totalNotifikasi;

      // handle response permintaan
      this.isPtLoading = false;
      this.permintaanTerakhir = res.permintaan.permintaan.map(v => ({
        ...v,
        status: this._permintaan.setStatus(v)
      }));
      this.totalPermintaanTerakhir = Number(res.permintaan.total) > 99 ? '99+' : res.permintaan.total;

      // handle response menunggu
      if ((this.user?.atasan || this.user?.penyetuju)) {
        this.isMtLoading = false;
        this.menungguPersetujuan = res.persetujuan.persetujuan;
        this.totalMenungguPersetujuan = Number(res.persetujuan.total) > 99 ? '99+' : res.persetujuan.total;
      }

      // done refresher
      if (refresher) refresher.target.complete();
    }, err => {
      console.log(err)
      this.isPtLoading = false;
      this.isMtLoading = false;
      if (refresher) refresher.target.complete();
    })
  }

  async ambilKategori() {
    this._beranda.kategori()
      .subscribe(async res => {
        console.log(res)
        if (!this.kategori?.every(element => res.kategori.some(({ _id }) => _id === element._id))) {
          this._storage.set('kategori', this.kategori);
          this.kategori = res.kategori;
        }


        let cekKategoriStorage = await this._storage.get('kategori')
        if (!cekKategoriStorage) this._storage.set('kategori', this.kategori);
      }, async err => {
        let kategoriLokal = await this._storage.get('kategori')
        if (kategoriLokal) this.kategori = kategoriLokal;
        console.log(err)
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  keluar(modal?) {
    this._auth.keluar();
    this._navCtrl.navigateRoot('/masuk', { animationDirection: 'forward' })
    modal.dismiss()
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }
}
