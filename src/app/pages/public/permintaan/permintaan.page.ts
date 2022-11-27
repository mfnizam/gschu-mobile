import { Component, OnDestroy } from '@angular/core';
import { User, UserService } from 'app/services/user/user.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BerandaService } from '../beranda/beranda.service';
import { PermintaanService } from './permintaan.service';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-permintaan',
  templateUrl: './permintaan.page.html'
})
export class PermintaanPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  user: User;

  permintaan = [];
  isLoading = true;
  // animateLoading = false;

  filterMax = new Date();
  filterMin = new Date('1 1 2020');
  tglFilter: { from: string, to: string }/*  = { from: this.tglFilterDefault.from.toISOString().split('T')[0], to: this.tglFilterDefault.to.toISOString().split('T')[0] } */;
  titleTglFilter = 'Semua Tanggal';

  statusFilter = 0;
  penyetujuFungsi = 'SCM & AM'
  titleStatusFilter = [
    'Semua Status',
    'Menunggu Persetujuan Atasan',
    'Ditolak Atasan',
    'Menunggu Persetujuan SCM & Asset',
    'Ditolak CSM & AM',
    'Sedang Diproses',
    'Permintaan Selesai',
    'Belum Beri Ulasan',
    'Sudah Beri Ulasan'
  ]

  pencarian = this._formBuilder.control(null);

  constructor(
    private _formBuilder: FormBuilder,
    private _permintaan: PermintaanService,
    private _user: UserService,
    private _beranda: BerandaService,
    private _alert: AlertController
  ) {
    this._user.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        this.user = user;
        console.log(this.user)
      })

    this.pencarian.valueChanges
    .pipe(debounceTime(700))
    .subscribe(value => {
      console.log(value);
      // this.ambilPermintaan(null, true, {})
    })
  }

  ionViewDidEnter() {
    // this.animateLoading = true;
    this.ambilPermintaan(null, this.permintaan.length < 1, { size: 10 });
    let skeleton = document.getElementById('loading-permintaan');
    if(skeleton) skeleton.classList.add('skeleton')
  }

  ionViewWillLeave(){
    let skeleton = document.getElementById('loading-permintaan');
    if(skeleton) skeleton.classList.remove('skeleton')
  }

  // ionViewDidLeave(){
  //   this.animateLoading = true;
  // }

  ambilPermintaan(refresher?, isLoading = false, filter?) {
    this.isLoading = isLoading;
    this._permintaan.permintaan(filter ? { filter: JSON.stringify(filter) } : undefined)
      .subscribe(res => {
        console.log(res);
        this.isLoading = false;
        this.permintaan = res.permintaan,
        this.permintaan = this.permintaan.map(v => ({
          ...v,
          // jenis: this._beranda._kategori.find(r => r.kode == v.kategori)?.nama,
          status: this._permintaan.setStatus(v)
        }));
        if(this.permintaan.length > 0){ // ganti nama scm & am ke nama fungsi penyetuju asli sesuai database
          let fungsi = this.permintaan[0].disetujui?.oleh?.fungsi?.nama;
          this.titleStatusFilter[3] = 'Menunggu Persetujuan ' + (fungsi || 'SCM & Asset')
          this.titleStatusFilter[4] = 'Ditolak ' + (fungsi || 'SCM & Asset')

        } 
        if (refresher) refresher.target.complete();
      }, err => {
        console.log(err)
        this.isLoading = false;
        if (refresher) refresher.target.complete();
      })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  tglFilterChange(e) {
    this.tglFilter = {
      from: moment(e.time).format('DD MMM YYYY'), //new Date(e.time).toISOString().split('T')[0];
      to: null
    }
  }
  pilihTglFilter(modal) {
    if (!this.tglFilter?.from) return
    modal.dismiss();
    this.ambilPermintaan(null, true, {
      rangeTgl: {
        dari: moment(this.tglFilter.from, "DD MMM YYYY").startOf('date'),
        ke: this.tglFilter.to ? moment(this.tglFilter.to, "DD MMM YYYY").endOf('date') : moment(this.tglFilter.from, "DD MMM YYYY").endOf('date')
      },
      status: this.statusFilter
    })
    if (!this.tglFilter?.to) return this.titleTglFilter = this.tglFilter.from.replace('-', ' ')

    let to = this.tglFilter?.to.split(' ');
    let from = this.tglFilter?.from.split(' ').filter(val => !to.includes(val)).join(" ")

    this.titleTglFilter = (from ? from + ' - ' : '') + to.join(' ')
  }
  hapusTglFilter(modal) {
    modal.dismiss();
    if (this.tglFilter && this.titleTglFilter != 'Semua Tanggal') this.ambilPermintaan(null, true)
    this.titleTglFilter = 'Semua Tanggal';
    this.tglFilter = null;
  }

  statusFilterChange(modal, e) {
    modal.dismiss();
    this.statusFilter = e.detail.value;
    this.ambilPermintaan(null, true, {
      status: e.detail.value,
      ...this.tglFilter? {
        rangeTgl: {
          dari: moment(this.tglFilter.from, "DD MMM YYYY").startOf('date'),
          ke: this.tglFilter.to ? moment(this.tglFilter.to, "DD MMM YYYY").endOf('date') : moment(this.tglFilter.from, "DD MMM YYYY").endOf('date')
        }
      } : {}
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
}
