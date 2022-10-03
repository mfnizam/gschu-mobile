import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'app/services/user/user.service';
import { Wilayah } from '../wilayah/wilayah.types';
import { Zona } from '../zona/zona.types';
import { FungsiService } from './fungsi.service';
import { Fungsi, Organisasi } from './fungsi.types';

@Component({
  selector: 'app-fungsi',
  templateUrl: './fungsi.page.html'
})
export class FungsiPage {

  loadingDataFungsi = true;
  dataFungsi: Fungsi[] = [];
  loadingDataSelectOrganisasi = false;
  dataSelectOrganisasi: Organisasi[] = [];
  loadingDataSelectUser = false; // Data untuk pemilihan atasan/penyetuju
  dataSelectUser: User[] = [];

  formCreateUpdateFungsi: FormGroup = this.formBuilder.group({
    _id: [null],
    nama: ['', [Validators.required]],
    kode: ['', [Validators.required]],
    organisasi: ['', [Validators.required]], // organisasi berupa zona/wilayah kerja
    namaOrganisasi: ['', [Validators.required]],
    ttdAtasan: [null],
    atasan: [null],
    dataAtasan: [null],
    ttdPenyetuju: [null],
    penyetuju: [null],
    dataPenyetuju: [null],
  })
  loadingCreateUpdateFungsi = false;

  idItemAction: string;

  selectedOrganisasi: Organisasi;
  selectedUser: User;

  constructor(
    private fungsi: FungsiService,
    private formBuilder: FormBuilder,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  ionViewDidEnter() {
    this.getFungsi()
  }

  getFungsi() {
    this.loadingDataFungsi = true;
    this.fungsi.getFungsi({})
      .subscribe(res => {
        console.log(res)
        this.loadingDataFungsi = false;
        this.dataFungsi = res.fungsi
      }, err => {
        console.log(err)
        this.loadingDataFungsi = false;
      })
  }

  createUpdateFungsi(modal) {
    modal.present();
    if (this.formCreateUpdateFungsi.invalid) return;
    this.loadingCreateUpdateFungsi = true;

    let value = this.formCreateUpdateFungsi.value;
    if (value._id) {
      this.fungsi.updateFungsi(value)
        .subscribe(res => {
          console.log(res)
          this.loadingCreateUpdateFungsi = false;
          this.getFungsi();
          modal.dismiss();
        }, err => {
          console.log(err)
          this.loadingCreateUpdateFungsi = false;
        })
    } else {
      this.fungsi.createFungsi(value)
        .subscribe(res => {
          console.log(res)
          this.loadingCreateUpdateFungsi = false;
          this.getFungsi();
          modal.dismiss();
        }, err => {
          console.log(err)
          this.loadingCreateUpdateFungsi = false;
        })
    }
  }

  ttdAtasanChange(e){
    console.log(e.detail.checked)
    if(!e.detail.checked) this.formCreateUpdateFungsi.patchValue({
      atasan: null,
      dataAtasan: null
    })
  }

  modalCreateUpdateFungsiDidDismiss() {
    this.formCreateUpdateFungsi.reset()
  }

  itemAction(modal, idItem) {
    modal.present();
    this.idItemAction = idItem;
  }

  async actionUpdateItem(modalItemAction, modalCreateUpdateFungsi, id) {
    if (modalItemAction) await modalItemAction.dismiss();
    modalCreateUpdateFungsi.present();
    let fungsi: Fungsi = this.dataFungsi.find(v => v._id == id)
    if(!fungsi) return; // TODO: show toast
    this.formCreateUpdateFungsi.patchValue({
      ...fungsi,
      organisasi: fungsi.organisasi?._id,
      namaOrganisasi: fungsi.organisasi?.nama + (fungsi.organisasi.tipe == 'wilayah' ? ' - ' + fungsi.organisasi.zona.nama : ''),
      atasan: fungsi.atasan?._id,
      dataAtasan: fungsi.atasan,
      penyetuju: fungsi.penyetuju?._id,
      dataPenyetuju: fungsi.penyetuju
    })
  }

  async actionDeleteItem(modal, id) {
    if (!id) return;
    let alert = await this.alert.create({
      header: 'Apakah anda yakin ingin menghapus data fungsi ini?',
      mode: 'ios',
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;
    let loading = await this.loading.create({
      message: 'Menghapus fungsi..',
      mode: 'ios'
    })
    loading.present();

    this.fungsi.deleteFungsi(id)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        modal.dismiss();
        this.getFungsi();
      }, async err => {
        loading.dismiss();
        console.log(err);
        // modal.dismiss();
        // TODO: add toast
      })
  }

  modalActionDidDismiss() {
    // not implemented yet
  }

  openModalSelectOrganisasi(modal) {
    modal.present();
    this.loadingDataSelectOrganisasi = true;
    this.fungsi.getOrganisasi({})
      .subscribe(res => {
        console.log(res)
        this.loadingDataSelectOrganisasi = false;
        this.dataSelectOrganisasi = res.organisasi;
        this.selectedOrganisasi = res.organisasi.find(v => v._id == this.formCreateUpdateFungsi.get('organisasi').value)
      }, err => {
        console.log(err)
        this.loadingDataSelectOrganisasi = false;
      })
  }

  selectOrganisasi(modal) {
    if (!this.selectedOrganisasi?._id) return;
    this.formCreateUpdateFungsi.patchValue({
      organisasi: this.selectedOrganisasi._id,
      namaOrganisasi: this.selectedOrganisasi?.nama + (this.selectedOrganisasi.tipe == 'wilayah' ? ' - ' + (this.selectedOrganisasi as Wilayah).zona.nama : '')
    })
    modal.dismiss()
  }

  selectOrganisasiDidDismiss() {
    this.selectedOrganisasi = null;
  }

  openModalSelectAtasan(modal){
    modal.present();
    this.loadingDataSelectUser = true;
    this.fungsi.getUser({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataSelectUser = false;
      this.dataSelectUser = res.user;
    }, err => {
      console.log(err)
      this.loadingDataSelectUser = false;
    })
  }

  selectAtasan(modal){
    modal.dismiss();
    this.formCreateUpdateFungsi.patchValue({
      atasan: this.selectedUser._id,
      dataAtasan: this.selectedUser
    })
  }

  deleteAtasan(){
    this.formCreateUpdateFungsi.patchValue({
      atasan: null,
      dataAtasan: null
    })
  }

  modalSelectAtasanDidDismiss(){
    this.selectedUser = null
  }

  openModalSelectPenyetuju(modal){
    modal.present();
    this.loadingDataSelectUser = true;
    this.fungsi.getUser({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataSelectUser = false;
      this.dataSelectUser = res.user;
    }, err => {
      console.log(err)
      this.loadingDataSelectUser = false;
    })
  }

  selectPenyetuju(modal){
    modal.dismiss();
    this.formCreateUpdateFungsi.patchValue({
      penyetuju: this.selectedUser._id,
      dataPenyetuju: this.selectedUser
    })
  }

  deletePenyetuju(){
    this.formCreateUpdateFungsi.patchValue({
      penyetuju: null,
      dataPenyetuju: null
    })
  }

  selectPenyetujuDidDismiss(){
    this.selectedUser = null
  }

}
