import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pengguna',
  templateUrl: './pengguna.page.html'
})
export class PenggunaPage {

  formFilterPengguna: FormGroup = this.formBuilder.group({
    fungsi: [null],
    namaFungsi: [null]
  })

  constructor(
    private formBuilder: FormBuilder
  ) { }


}
