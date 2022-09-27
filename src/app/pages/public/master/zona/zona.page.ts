import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ZonaService } from './zona.service';
import { Zona } from './zona.types';

@Component({
  selector: 'app-zona',
  templateUrl: './zona.page.html'
})
export class ZonaPage {

  loadingDataZona = true;
  dataZona: Zona[] = []

  formCreateUpdateZona: FormGroup = this.formBuilder.group({
    _id: [null],
    nama: ['', [Validators.required]]
  })
  loadingCreateUpdateZona = false;

  idItemAction: string;

  constructor(
    private zona: ZonaService,
    private formBuilder: FormBuilder,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  ionViewDidEnter(){
    this.getZona();
  }

  getZona(){
    this.loadingDataZona = true;
    this.zona.getZona({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataZona = false;
      this.dataZona = res.zona;
    }, err => {
      console.log(err)
      this.loadingDataZona = false;
    })
  }

  createUpdateZona(modal){
    if(this.formCreateUpdateZona.invalid) return;
    this.loadingCreateUpdateZona = true;

    let value = this.formCreateUpdateZona.value;
    if(value._id){
      this.zona.updateZona(value)
      .subscribe(res => {
        console.log(res)
        this.loadingCreateUpdateZona = false;
        this.getZona();
        modal.dismiss();
      }, err => {
        console.log(err)
        this.loadingCreateUpdateZona = false;
      })
    }else {
      this.zona.createZona(value)
      .subscribe(res => {
        console.log(res)
        this.loadingCreateUpdateZona = false;
        this.getZona();
        modal.dismiss();
      }, err => {
        console.log(err)
        this.loadingCreateUpdateZona = false;
      })
    }
  }

  modalCreateUpdateZonaDidDismiss(){
    // not implemented yet
  }

  itemAction(modal, idItem){
    modal.present();
    this.idItemAction = idItem;
  }

  async actionUpdateItem(modalItemAction, modalCreateUpdateZona, id) {
    if(modalItemAction) await modalItemAction.dismiss();
    modalCreateUpdateZona.present();
    this.formCreateUpdateZona.patchValue(this.dataZona.find(v => v._id == id))
  }

  async actionDeleteItem(modal, id) {
    if (!id) return;
    let alert = await this.alert.create({
      header: 'Apakah anda yakin ingin menghapus data zona ini?',
      mode: 'ios',
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;
    let loading = await this.loading.create({
      message: 'Menghapus zona..',
      mode: 'ios'
    })
    loading.present();

    this.zona.deleteZona(id)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        modal.dismiss();
        this.getZona();
      }, async err => {
        loading.dismiss();
        console.log(err);
        // modal.dismiss();
        // TODO: add toast
      })
  }

  modalActionDidDismiss(){
    this.formCreateUpdateZona.reset();
  }

}
