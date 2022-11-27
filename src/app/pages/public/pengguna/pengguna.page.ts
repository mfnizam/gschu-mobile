import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from 'app/services/user/user.service';
import { PenggunaService } from './pengguna.service';

@Component({
  selector: 'app-pengguna',
  templateUrl: './pengguna.page.html'
})
export class PenggunaPage {

  dataPengguna: User[] = [];
  totalPengguna = 0;
  dataPenggunaLoading = false;

  formFilterPengguna: FormGroup = this.formBuilder.group({
    fungsi: [null],
    namaFungsi: [null]
  })

  constructor(
    private formBuilder: FormBuilder,
    private _pengguna: PenggunaService
  ) {
    this._pengguna.pengguna()
    .subscribe(res => {
      console.log(res);
      this.dataPengguna = res.pengguna;
    }, err => {
      console.log(err)
    })
  }

  submitFilter(){

  }

}
