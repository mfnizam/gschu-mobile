import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Kategori } from '../beranda/beranda.service';
import { KategoriService } from './kategori.service';

@Component({
  selector: 'app-kategori',
  templateUrl: './kategori.page.html'
})
export class KategoriPage {

  kategori: Kategori[] = [];

  formUbahKategori: FormGroup = this._formBuilder.group({
    _id: [null, [Validators.required]],
    nama: [null, [Validators.required]],
    kode: [null, [Validators.required]],
    atasan: [false, [Validators.required]],
    diselesaikanPemohon: [false]
  })
  loadingUbahKategori = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _kategori: KategoriService
  ) {
    this.getKategori();
  }

  getKategori(){
    this._kategori.kategori()
    .subscribe(res => {
      console.log(res);
      this.kategori = res.kategori
    }, err => {
      console.log(err);
    })
  }

  openEditKategori(modal: any, kategori: Kategori){
    this.formUbahKategori.patchValue(kategori);
    modal.present();
  }

  ubahKategori(modal: any){
    console.log(this.formUbahKategori.value)
    if(this.formUbahKategori.invalid) return;
    this.loadingUbahKategori = true;
    this._kategori.updateKategori(this.formUbahKategori.value)
    .subscribe(res => {
      console.log(res);
      this.loadingUbahKategori = false;
      modal.dismiss();
      this.getKategori();
    }, err => {
      this.loadingUbahKategori = false;
      console.log(err)
    })
  }

  modalUbahKategoriDismiss(){
    this.loadingUbahKategori = false;
    this.formUbahKategori.reset();
  }
}
