import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ZonaService } from '../zona/zona.service';
import { Zona } from '../zona/zona.types';
import { WilayahService } from './wilayah.service';
import { Wilayah } from './wilayah.types';

@Component({
  selector: 'app-wilayah',
  templateUrl: './wilayah.page.html'
})
export class WilayahPage {

  loadingDataWilayah = true;
  dataWilayah: Wilayah[] = [];
  loadingDataSelectZona = false;
  dataSelectZona: Zona[] = [];

  formCreateUpdateWilayah: FormGroup = this.formBuilder.group({
    _id: [null],
    nama: ['', [Validators.required]],
    zona: ['', [Validators.required]],
    namaZona: ['', [Validators.required]],
  })
  loadingCreateUpdateWilayah = false;

  idItemAction: string;

  selectedZona: Zona;

  constructor(
    private wilayah: WilayahService,
    private zona: ZonaService,
    private formBuilder: FormBuilder,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  ionViewDidEnter(){
    this.getWilayah();
  }
  
  getWilayah(){
    this.loadingDataWilayah = true;
    this.wilayah.getWilayah({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataWilayah = false;
      this.dataWilayah = res.wilayah;
    }, err => {
      console.log(err)
      this.loadingDataWilayah = false;
    })
  }

  createUpdateWilayah(modal){
    modal.present();
    if(this.formCreateUpdateWilayah.invalid) return;
    this.loadingCreateUpdateWilayah = true;

    let value = this.formCreateUpdateWilayah.value;
    if(value._id){
      this.wilayah.updateWilayah(value)
      .subscribe(res => {
        console.log(res)
        this.loadingCreateUpdateWilayah = false;
        this.getWilayah();
        modal.dismiss();
      }, err => {
        console.log(err)
        this.loadingCreateUpdateWilayah = false;
      })
    }else {
      this.wilayah.createWilayah(value)
      .subscribe(res => {
        console.log(res)
        this.loadingCreateUpdateWilayah = false;
        this.getWilayah();
        modal.dismiss();
      }, err => {
        console.log(err)
        this.loadingCreateUpdateWilayah = false;
      })
    }
  }

  modalCreateUpdateWilayahDidDismiss(){
    // not implemented yet
  }

  itemAction(modal, idItem){
    modal.present();
    this.idItemAction = idItem;
  }

  async actionUpdateItem(modalItemAction, modalCreateUpdateWilayah, id) {
    if(modalItemAction) await modalItemAction.dismiss();
    modalCreateUpdateWilayah.present();
    let wilayah: Wilayah = this.dataWilayah.find(v => v._id == id)
    this.formCreateUpdateWilayah.patchValue({
      ...wilayah,
      zona: wilayah.zona?._id,
      namaZona: wilayah.zona?.nama
    })
  }

  async actionDeleteItem(modal, id) {
    if (!id) return;
    let alert = await this.alert.create({
      header: 'Apakah anda yakin ingin menghapus data wilayah ini?',
      mode: 'ios',
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;
    let loading = await this.loading.create({
      message: 'Menghapus wilayah..',
      mode: 'ios'
    })
    loading.present();

    this.wilayah.deleteWilayah(id)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        modal.dismiss();
        this.getWilayah();
      }, async err => {
        loading.dismiss();
        console.log(err);
        // modal.dismiss();
        // TODO: add toast
      })
  }

  modalActionDidDismiss(){
    this.formCreateUpdateWilayah.reset();
  }

  openModalSelectZona(modal){
    modal.present();
    this.loadingDataSelectZona = true;
    this.zona.getZona({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataSelectZona = false;
      this.dataSelectZona = res.zona;
      this.selectedZona = res.zona.find(v => v._id == this.formCreateUpdateWilayah.get('zona').value)
    }, err => {
      console.log(err)
      this.loadingDataSelectZona = false;
    })
  }

  selectZone(modal){
    if(!this.selectedZona?._id) return;
    this.formCreateUpdateWilayah.patchValue({
      zona: this.selectedZona._id,
      namaZona: this.selectedZona.nama
    })
    modal.dismiss()
  }

  selectZoneDidDismiss(){
    this.selectedZona = null;
  }

}
