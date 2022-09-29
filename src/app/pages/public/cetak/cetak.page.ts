import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FungsiService } from '../master/fungsi/fungsi.service';
import { Fungsi } from '../master/fungsi/fungsi.types';
import { CetakService } from './cetak.service';
import * as moment from 'moment';

@Component({
  selector: 'app-cetak',
  templateUrl: './cetak.page.html'
})
export class CetakPage {
  jenis: string;
  loadingDataPermintaan = false;
  dataPerminataan /* TODO: Add permintaan types */ = [];

  loadingDataSelectFungsi = false;
  dataSelectFungsi: Fungsi[] = [];
  loadingCetak = false;

  formFilterCetakFungsi: FormGroup = this.formBuilder.group({
    fungsi: [null, Validators.required],
    namaFungsi: [null],
    tanggalStart: [null],
    kategori: [null],
    namaKategori: [null],
    tanggalEnd: [null],
    tanggalCombine: [null]
  })

  selectedFungsi: Fungsi;
  selectedDate: { from: string, to: string } = { from: null, to: null }
  maxDate: Date = new Date();
  minDate = new Date('1 1 2020');

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private cetak: CetakService,
    private fungsi: FungsiService,
    private loading: LoadingController
  ) {
    this.jenis = this.route.snapshot.params.jenis
  }

  openModalSelectFungsi(modal) {
    modal.present();
    this.loadingDataSelectFungsi = true;
    this.fungsi.getFungsi({})
      .subscribe(res => {
        console.log(res)
        this.loadingDataSelectFungsi = false;
        this.dataSelectFungsi = res.fungsi;
        this.selectedFungsi = res.fungsi.find(v => v._id == this.formFilterCetakFungsi.get('fungsi').value)
      }, err => {
        console.log(err)
        this.loadingDataSelectFungsi = false;
      })
  }

  selectFungsi(modal) {
    if (!this.selectedFungsi?._id) return;
    this.formFilterCetakFungsi.patchValue({
      fungsi: this.selectedFungsi._id,
      namaFungsi: this.selectedFungsi?.nama + ' - ' + this.selectedFungsi.organisasi.nama + (this.selectedFungsi.organisasi.tipe == 'wilayah'? ' - ' + this.selectedFungsi.organisasi.zona.nama : ''),
    });
    modal.dismiss()
  }

  selectFungsiDidDismiss() {
    this.selectedFungsi = null;
  }

  selectDateChange(e){
    this.selectedDate = {
      from: moment(e.time).format('DD MMM YYYY'), //new Date(e.time).toISOString().split('T')[0];
      to: null
    }
  }

  selectDate(modal){
    if (!this.selectedDate.from) return
    modal.dismiss();
    this.formFilterCetakFungsi.patchValue({
      tanggalStart: this.selectedDate.from,
      tanggalEnd: this.selectedDate.to,
      tanggalCombine: this.selectedDate.from + (this.selectedDate.to? ' - ' + this.selectedDate.to : '')
    })
  }

  deleteSelectedDate(modal) {
    modal.dismiss();
    this.selectedDate = { from: null, to: null };
    this.formFilterCetakFungsi.patchValue({ tanggalStart: null, tanggalEnd: null, tanggalCombine: null})
  }

  submitFilter(){
    // TODO: request permintaan dengan filter
    console.log('ambil permintaan')
  }

  async printPermintaan(){
    let loading = await this.loading.create({
      mode: 'ios',
      message: 'Memuat data permintaan ' + this.selectedFungsi?.nama
    });
    loading.present();
    this.cetak.getPermintaan({ fungsi: this.selectedFungsi._id })
    .subscribe(res => {
      console.log(res)
      loading.dismiss();
    }, err => {
      console.log(err);
      loading.dismiss();
    })
  }
}
