import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { User } from 'app/services/user/user.service';
import { FungsiService } from '../fungsi/fungsi.service';
import { Fungsi } from '../fungsi/fungsi.types';
import { JabatanService } from './jabatan.service';
import { Jabatan } from './jabatan.types';

@Component({
  selector: 'app-jabatan',
  templateUrl: './jabatan.page.html'
})
export class JabatanPage {

  loadingDataJabatan = true;
  dataJabatan: Jabatan[] = [];
  loadingDataSelectFungsi = false;
  dataSelectFungsi: Fungsi[] = [];
  loadingDataSelectUser = false;
  dataSelectUser: User[] = [];

  formCreateUpdateJabatan: FormGroup = this.formBuilder.group({
    _id: [null],
    nama: ['', [Validators.required]],
    fungsi: ['', [Validators.required]],
    namaFungsi: ['', [Validators.required]],
    atasanFungsi: [true],
    atasan: [null],
    dataAtasan: [null],
  })
  loadingCreateUpdateJabatan = false;

  idItemAction: string;

  selectedFungsi: Fungsi
  selectedUser: User;

  constructor(
    private jabatan: JabatanService,
    private fungsi: FungsiService,
    private formBuilder: FormBuilder,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  ionViewDidEnter(){
    this.getJabatan()
  }

  getJabatan(){
    this.loadingDataJabatan = true;
    this.jabatan.getJabatan({})
    .subscribe(res => {
      console.log(res)
      this.loadingDataJabatan = false;
      this.dataJabatan = res.jabatan;
    }, err => {
      console.log(err)
      this.loadingDataJabatan = false;
    })
  }

  createUpdateJabatan(modal) {
    modal.present();
    if (this.formCreateUpdateJabatan.invalid) return;
    this.loadingCreateUpdateJabatan = true;

    let value = this.formCreateUpdateJabatan.value;
    if (value._id) {
      this.jabatan.updateJabatan(value)
        .subscribe(res => {
          console.log(res)
          this.loadingCreateUpdateJabatan = false;
          this.getJabatan();
          modal.dismiss();
        }, err => {
          console.log(err)
          this.loadingCreateUpdateJabatan = false;
        })
    } else {
      this.jabatan.createJabatan(value)
        .subscribe(res => {
          console.log(res)
          this.loadingCreateUpdateJabatan = false;
          this.getJabatan();
          modal.dismiss();
        }, err => {
          console.log(err)
          this.loadingCreateUpdateJabatan = false;
        })
    }
  }

  modalCreateUpdateJabatanDidDismiss() {
    this.formCreateUpdateJabatan.reset({ atasanFungsi: true });
  }

  itemAction(modal, idItem) {
    modal.present();
    this.idItemAction = idItem;
  }

  async actionUpdateItem(modalItemAction, modalCreateUpdateFungsi, id) {
    if (modalItemAction) await modalItemAction.dismiss();
    modalCreateUpdateFungsi.present();
    let jabatan: Jabatan = this.dataJabatan.find(v => v._id == id)
    this.formCreateUpdateJabatan.patchValue({
      ...jabatan,
      fungsi: jabatan.fungsi?._id,
      namaFungsi: jabatan.fungsi?.nama + ' - ' + jabatan.fungsi.organisasi.nama + (jabatan.fungsi.organisasi.tipe == 'wilayah'? ' - ' + jabatan.fungsi.organisasi.zona.nama : ''),
      atasanFungsi: !!jabatan.fungsi.atasan?._id,
      atasan: jabatan.atasan._id,
      dataAtasan: jabatan.atasan,
    })
  }

  async actionDeleteItem(modal, id) {
    if (!id) return;
    let alert = await this.alert.create({
      header: 'Apakah anda yakin ingin menghapus data jabatan ini?',
      mode: 'ios',
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;
    let loading = await this.loading.create({
      message: 'Menghapus jabatan..',
      mode: 'ios'
    })
    loading.present();

    this.jabatan.deleteJabatan(id)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        if(!res) throw 'Gagal menghapus'
        modal.dismiss();
        this.getJabatan();
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

  openModalSelectFungsi(modal) {
    modal.present();
    this.loadingDataSelectFungsi = true;
    this.fungsi.getFungsi({})
      .subscribe(res => {
        console.log(res)
        this.loadingDataSelectFungsi = false;
        this.dataSelectFungsi = res.fungsi;
        this.selectedFungsi = res.fungsi.find(v => v._id == this.formCreateUpdateJabatan.get('fungsi').value)
      }, err => {
        console.log(err)
        this.loadingDataSelectFungsi = false;
      })
  }

  selectFungsi(modal) {
    if (!this.selectedFungsi?._id) return;
    this.formCreateUpdateJabatan.patchValue({
      fungsi: this.selectedFungsi._id,
      namaFungsi: this.selectedFungsi?.nama + ' - ' + this.selectedFungsi.organisasi.nama + (this.selectedFungsi.organisasi.tipe == 'wilayah'? ' - ' + this.selectedFungsi.organisasi.zona.nama : ''),
      atasanFungsi: this.selectedFungsi.atasan?._id
    })
    modal.dismiss()
  }

  selectFungsiDidDismiss() {
    this.selectedFungsi = null;
  }

  openModalSelectAtasan(modal) {
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
    this.formCreateUpdateJabatan.patchValue({
      atasan: this.selectedUser._id,
      dataAtasan: this.selectedUser
    })
  }

  deleteAtasan(){
    this.formCreateUpdateJabatan.patchValue({
      atasan: null,
      dataAtasan: null
    })
  }

  modalSelectAtasanDidDismiss(){
    this.selectedUser = null
  }

}
