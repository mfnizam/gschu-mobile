import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AlertController,
  LoadingController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { User, UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BerandaService, Kategori } from '../beranda/beranda.service';
import { PersetujuanService } from '../persetujuan/persetujuan.service';
import { PermintaanService } from '../permintaan/permintaan.service';
import { PdfService } from 'app/services/pdf/pdf.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
/* 
  TODO:
    - optimasi halaman detail
      - transisi tidak smooth ketika meninggalkan halaman dalam keadaan loading
        solusi:
        - hapus class "skeleton" pada ionViewWillLeave
*/

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
})
export class DetailPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  user: User = {} as User;

  idPermintaan;
  jenisPermintaan;
  permintaan /* : Permintaan */;

  isLoading = true;
  toast;

  kategori: Kategori = {} as Kategori;
  catatanTolak;

  namaPenerima;
  selesaiLoading = false;

  constructor(
    private _route: ActivatedRoute,
    private _user: UserService,
    private _permintaan: PermintaanService,
    private _persetujuan: PersetujuanService,
    private _beranda: BerandaService,
    private _toast: ToastController,
    private _loading: LoadingController,
    private _alert: AlertController,
    private _pdf: PdfService,
    private _platform: Platform
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((params) => {
        this.idPermintaan = params.id;
        this.jenisPermintaan = params.jenis;
        console.log(this.jenisPermintaan);
      });

    this._user.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      this.user = user;
    });
  }

  ionViewDidEnter() {
    this.ambilPermintaan();
    let skeleton = document.getElementById('loading-detail');
    if (skeleton) skeleton.classList.add('skeleton');
  }

  ambilPermintaan(refresher?, loading = true, hanyattd = false) {
    this.isLoading = loading;
    if (this.jenisPermintaan == 'permintaan') {
      this._permintaan.detail(this.idPermintaan).subscribe(
        (res) => {
          console.log(res);
          this.isLoading = false;
          if (refresher) refresher.target.complete();
          if (res.permintaan) this.prosesPermintaan(res.permintaan, hanyattd);
        },
        (err) => {
          if (refresher) refresher.target.complete();
          this.showMsg(err);
        }
      );
    } else if (this.jenisPermintaan == 'persetujuan') {
      this._persetujuan.detail(this.idPermintaan).subscribe(
        (res) => {
          console.log(res);
          this.isLoading = false;
          if (refresher) refresher.target.complete();
          if (res.permintaan) this.prosesPermintaan(res.permintaan, hanyattd);
        },
        (err) => {
          if (refresher) refresher.target.complete();
          this.showMsg(err);
        }
      );
    }
  }

  prosesPermintaan(permintaan, hanyattd) {
    if (!hanyattd || !this.permintaan) {
      this.permintaan = permintaan;
      // this.permintaan.nama = this._beranda._kategori.find(v => v.kode == permintaan?.kategori)?.nama;

      // this.permintaan.user['inisial'] = this.getInitial(permintaan.user.namaLengkap);
      if (this.permintaan.user.foto)
        this.permintaan.user['foto'] = permintaan.user.foto;
    } else {
      this.permintaan.diketahui = permintaan.diketahui;
      this.permintaan.disetujui = permintaan.disetujui;
      this.permintaan.selesai = permintaan.selesai;
    }

    this.permintaan.status = this._permintaan.setStatus(permintaan);

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

  async showMsg(
    err,
    msg = 'Gagal memuat data permintaan. Coba beberapa saat lagi',
    color = 'danger'
  ) {
    //console.log(err)
    this.isLoading = false;

    if (this.toast) this.toast.dismiss();
    this.toast = await this._toast.create({
      message: msg,
      duration: 3000,
      color,
      mode: 'ios',
      buttons: [{ icon: 'close' }],
    });
    this.toast.present();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async tolak(modal) {
    if (!this.catatanTolak)
      return this.showMsg(null, 'Harap isi catatan', 'danger');
    let loading = await this._loading.create({
      message: 'Memproses penolakan permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000,
    });
    modal.dismiss();
    loading.present();

    this._persetujuan.tolak(this.idPermintaan, this.catatanTolak).subscribe(
      (res) => {
        console.log(res);
        loading.dismiss();
        if (!res)
          return this.showMsg(
            null,
            'Gagal menolak permintaan. Coba beberapa saat lagi.'
          );
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menolak permintaan.', 'success');
      },
      (err) => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(err, 'Gagal menolak permintaan. Coba beberapa saat lagi.');
      }
    );
  }

  async openSetujuTolakModal(modal) {
    if (
      this.permintaan.diketahui.oleh &&
      this.permintaan.disetujui.oleh._id == this.user._id &&
      this.permintaan.diketahui.status !== 1
    ) {
      let permitedAlert = await this._alert.create({
        message: 'Permintaan ini ditolak / belum disetujui atasan.',
        mode: 'ios',
        buttons: [{ text: 'Tutup' }],
      });
      permitedAlert.present();
      return;
    }
    modal.present();
  }

  async setuju(modal) {
    let loading = await this._loading.create({
      message: 'Memproses persetujuan permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000,
    });
    modal.dismiss();
    loading.present();

    this._persetujuan.setuju(this.idPermintaan).subscribe(
      (res) => {
        console.log(res);
        loading.dismiss();
        if (!res)
          return this.showMsg(
            null,
            'Gagal menyetujui permintaan. Coba beberapa saat lagi.'
          );
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menyetujui permintaan.', 'success');
      },
      (err) => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(
          err,
          'Gagal menyetujui permintaan. Coba beberapa saat lagi.'
        );
      }
    );
  }

  async selesai(id) {
    let alert = await this._alert.create({
      header: 'Konfirmasi Permintaan Telah Diselesaikan',
      mode: 'ios',
      cssClass: 'item-' + this.permintaan.kategori.kode,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: 'Selesai', role: 'ok' },
      ],
    });
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;

    let loading = await this._loading.create({
      message: 'Memproses penyelesaian permintaan. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000,
    });
    // modal.dismiss();
    loading.present();

    this._persetujuan.selesai(id).subscribe(
      (res) => {
        console.log(res);
        loading.dismiss();
        if (!res)
          return this.showMsg(
            null,
            'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.'
          );
        this.ambilPermintaan(null, false, true);
        this.showMsg(null, 'Berhasil menyelesaikan permintaan.', 'success');
      },
      (err) => {
        loading.dismiss();
        //console.log(err)
        this.showMsg(
          err,
          'Gagal menyelesaikan permintaan. Coba beberapa saat lagi.'
        );
      }
    );
  }

  async selesaiPemohon(modal) {
    let loading = await this._loading.create({
      message: 'Memproses konfirmasi. Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000,
    });
    modal.dismiss();
    loading.present();
    this._permintaan
      .selesaiPemohon(this.permintaan._id, this.namaPenerima)
      .subscribe(
        (res) => {
          console.log(res);
          loading.dismiss();
          this.ambilPermintaan();
        },
        (err) => {
          console.log(err);
          loading.dismiss();
          this.showMsg(
            err,
            'Gagal konfirmasi selesai permintaan. Coba beberapa saat lagi.'
          );
        }
      );
  }

  async openUlasan(ulasan) {
    let alert = await this._alert.create({
      header: 'Ulasan Permintaan',
      message: ulasan,
      mode: 'ios',
      buttons: [{ text: 'Tutup', role: 'cancel' }],
    });
    alert.present();
  }
  
  async cetakPermintaan() {
    let loading = await this._loading.create({
      message: 'Menyimpan permintaan (PDF). Mohon tunggu...',
      mode: 'ios',
      backdropDismiss: false,
      duration: 60000,
    });
    loading.present();


    let pdf;

    switch (this.permintaan.kategori.kode) {
      case 'rdp':
        pdf = this._pdf.generatePermintaanRDP(this.permintaan);
        break;

      case 'furniture':
        pdf = this._pdf.generatePermintaanFurniture(this.permintaan);
        break;

      case 'rumput':
        pdf = this._pdf.generatePermintaanRumput(this.permintaan);
        break;

      case 'ac':
        pdf = this._pdf.generatePermintaanAc(this.permintaan);
        break;

      case 'atk':
        pdf = this._pdf.generatePermintaanAtk(this.permintaan);
        break;

      case 'snack':
        pdf = this._pdf.generatePermintaanSnack(this.permintaan);
        break;

      case 'krp':
        pdf = this._pdf.generatePermintaanKrp(this.permintaan);
        break;

      case 'mess':
        pdf = this._pdf.generatePermintaanMess(this.permintaan);
        break;

      case 'dokumen':
        pdf = this._pdf.generatePermintaanDokumen(this.permintaan);
        break;

      case 'galon':
        pdf = this._pdf.generatePermintaanGalon(this.permintaan);
        break;

      case 'acara':
        pdf = this._pdf.generatePermintaanAcara(this.permintaan);
        break;

      case 'peralatan':
        pdf = this._pdf.generatePermintaanPeralatan(this.permintaan);
        break;

      default:
        break;
    }

    if (!pdf) return this.showMsg(null, 'Gagal menyimpan permintaan');

    
    if (this._platform.is('capacitor')) {
      Filesystem.writeFile({
        path: this.permintaan.kategori.nama + "_" + new Date().getTime() + '.pdf',
        data: pdf,
        directory: Directory.Documents,
        // encoding: Encoding.UTF8,
      })
        .then(() => {
          setTimeout(() => {
            loading.dismiss();
            this.showMsg(
              null,
              'Berhasil menyimpan permintaan pada folder Dokumen',
              'success'
            );
          }, 2000)
        })
        .catch((error) => {
          loading.dismiss();
          this.showMsg(null, 'Gagal menyimpan permintaan');
        });
    } else {
      loading.dismiss();
      window.open(pdf);
    }

  }
}
