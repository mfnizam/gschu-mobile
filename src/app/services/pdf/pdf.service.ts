import { TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {


  constructor(
    private _capitalize: TitleCasePipe
  ) { }

  // TODO: Move to helper
  generate(title: string, body: UserOptions['body'], nested?: { table: UserOptions, cellTitle: string }[]) {
    const doc = new jsPDF({ format: 'a4' });
    doc.setProperties({
      title
    })
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    let keys = body.slice(3, body.length - 10).map(v => v[1]?.content || v[1])
    let longestkey = keys.reduce((max, name) => name?.length > max?.length ? name : max, keys[0]);
    let cellWidth = doc.getTextWidth(longestkey || '')

    let columnStyles: UserOptions['columnStyles'] = {
      0: { cellWidth: 10 },
      2: { cellWidth: 4.2 },
      4: { cellWidth: 4.2 },
      6: { cellWidth: 10 },
      1: { cellWidth: cellWidth > 45 ? cellWidth : 45 },
      5: { cellWidth: cellWidth > 45 ? cellWidth : 45 }
    }

    autoTable(doc, {
      body,
      theme: 'plain',
      startY: 10,
      margin: { left: 10, right: 10 },
      columnStyles,
      tableLineColor: [0, 0, 0],
      rowPageBreak: 'avoid',
      didParseCell: (data) => {
        let title = data.row.raw[data.column.index]?.title;
        let nestedOption = nested?.find(v => v.cellTitle.includes(title));
        if (nestedOption) {
          data.row.height = 7.58472 * nestedOption.table.body.length + 5
        };
      },
      willDrawCell: (data) => {
        data.doc.setDrawColor("#000");

        // TODO: sementara hanya bisa handle 2 halaman. 
        if (data.row.index === 25 && data.cell.y >= 121) {
          data.row.height = height - data.cell.y - 10;
          data.doc.line(data.cell.x, data.cell.y + data.row.height, data.cell.x + data.cell.width, data.cell.y + data.row.height);
        }
        if (data.row.index === 26 && data.pageNumber > 1) {
          data.doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y)
        };
      },
      didDrawCell: (data) => {
        data.doc.setDrawColor("#000");

        let title = data.row.raw[data.column.index]?.title;

        let nestedOption = nested?.find(v => v.cellTitle.includes(title));
        if (nestedOption) {
          data.doc.autoTable({
            ...nestedOption.table,
            startY: data.cell.y + 2,
            margin: { left: data.cell.x },
            tableWidth: data.cell.width
          })
        };

        let rowLength = Math.max.apply(null, Object.keys(data.row.cells));
        if (data.row.index === 1 && data.column.index == rowLength) data.doc.addImage('assets/icons/logo_pdf.png', data.cell.x - 50, data.cell.y, 50, 13.72);
        if (title === 'approved') doc.addImage(
          'assets/icons/approved.png',
          data.cell.x + (data.cell.width / 2) - 18.8,
          data.cell.y + (data.cell.height / 2) - 9.51,
          37.6,
          19.2
        );

        if (title === 'request') data.doc.addImage(
          'assets/icons/request.png',
          data.cell.x + (data.cell.width / 2) - 18.8,
          data.cell.y + (data.cell.height / 2) - 9.51,
          37.6,
          19.2
        );

        if (data.column.index == 0 && title !== 'gap') data.doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.row.height);
        if (data.column.index == rowLength && title !== 'gap') data.doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.row.height);
        if (!title) return;

        if (title.includes('line')) {
          let topOrBottom = title == 'linebottom' ? data.row.height : 0
          data.doc.line(data.cell.x, data.cell.y + topOrBottom, data.cell.x + data.cell.width, data.cell.y + topOrBottom);
        }

        if (title == 'gap') data.row.height = 4;
      }
    })

    return doc.output('bloburl')
  }

  generatePermintaanHeader(permintaan): UserOptions['body'] {
    return [
      [{ content: '', colSpan: 7, title: 'linetop' }],
      ['', { content: 'FORM PERBAIKAN RDP & FASUM', colSpan: 3, styles: { fontStyle: 'bold', fontSize: 14 } }, { content: '', rowSpan: 2, colSpan: 2 }, ''],
      ['', { content: 'PT PERTAMINA HULU ROKAN ZONA 1', colSpan: 3 }, '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', 'No. Surat', ':', { content: permintaan.noSurat, colSpan: 3 }, ''],
      ['', 'Tanggal', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Kepada', ':', { content: 'SCM ' + permintaan.user.fungsi.organisasi.nama, colSpan: 3 }, ''], // ganti kata scm sesuai data wilayah kerja
      ['', 'Dari', ':', { content: permintaan.user.fungsi.nama, colSpan: 3 }, ''],
      [{ content: '', colSpan: 7, title: 'linebottom' }],
      [{ content: '', colSpan: 7, title: 'gap' }],
      [{ content: '', colSpan: 7, title: 'linetop' }],
    ]
  }

  generatePermintaanFooter(permintaan): UserOptions['body'] {
    let diketahui = this._capitalize.transform(permintaan.diketahui?.oleh?.namaLengkap);
    return [
      [{ content: '', colSpan: 7 }],
      ['', { content: 'Demikian disampaikan atas perhatiannya terimakasih.', colSpan: 5 }, ''],
      [{ content: '', colSpan: 7 }],
      ['', { content: new Date(permintaan.createAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 5 }, ''],
      ['', { content: 'Dibuat Oleh,', styles: { halign: 'center' } }, '', { content: diketahui ? 'Diketahui Oleh,' : '', styles: { halign: 'center' } }, '', { content: 'Disetujui Oleh,', styles: { halign: 'center' } }, ''],
      ['', { content: '', title: 'request', styles: { minCellHeight: 20 } }, '', { content: '', title: permintaan.diketahui.status === 1 ? 'approved' : 'notapproved', styles: { minCellHeight: 20 } }, '', { content: '', title: permintaan.disetujui.status === 1 ? 'approved' : 'notapproved', styles: { minCellHeight: 20 } }, ''],
      ['', { content: this._capitalize.transform(permintaan.user.namaLengkap), styles: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold' } }, '', { content: diketahui || '', styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: this._capitalize.transform(permintaan.disetujui.oleh.namaLengkap), styles: { halign: 'center', fontStyle: 'bold' } }, ''],
      ['', { content: this._capitalize.transform(permintaan.user.jabatan.nama), styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: diketahui ? this._capitalize.transform(permintaan.diketahui.oleh.jabatan.nama) : '', styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: this._capitalize.transform(permintaan.disetujui.oleh.jabatan.nama), styles: { halign: 'center', fontStyle: 'bold' } }, ''],
      [{ content: '', colSpan: 7, title: 'linebottom' }],
    ]
  }

  generatePermintaanRDP(permintaan) {
    let alamat = permintaan.permintaan.alamat
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Alamat RDP/Fasum', ':', { content: alamat[0].toUpperCase() + alamat.substring(1), colSpan: 3 }, ''],
      ['', 'Jenis Kerusakan', ':', { content: permintaan.permintaan.perbaikan.map(v => v.jenis).join(','), colSpan: 3 }, ''],
      ['', 'Harapan Tgl Perbaikan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanFurniture(permintaan) {
    let tableFurniture: UserOptions = {
      theme: 'grid',
      body: [
        [{ content: 'No', styles: { fontStyle: 'bold' } }, { content: 'Nama Furniture', styles: { fontStyle: 'bold' } }, { content: 'Jumlah', styles: { fontStyle: 'bold' } }, { content: 'Satuan', styles: { fontStyle: 'bold' } }],
        ...permintaan.permintaan.furniture.map((furniture, i) => {
          return [i + 1, furniture.nama, furniture.jumlah, furniture.satuan]
        })
      ],
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
      }
    }
    let alamat = permintaan.permintaan.alamat;
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Alamat Pengiriman', ':', { content: alamat[0].toUpperCase() + alamat.substring(1), colSpan: 3 }, ''],
      ['', { content: '', title: 'furniture', colSpan: 5 }, ''],
      ['', 'Tgl Diperlukan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];

    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(
      perihal,
      [...header, ...content, ...footer],
      [
        { table: tableFurniture, cellTitle: 'furniture' },
      ]);
  }

  generatePermintaanRumput(permintaan) {
    let alamat = permintaan.permintaan.pemotongan.map((v, i, a) => {
      return (a.length > 1 ? (i + 1) + ". " : '') + v.lokasi[0].toUpperCase() + v.lokasi.substring(1)
    })
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Lokasi Pohon/Rumput', ':', { content: alamat.join('\n\n'), colSpan: 3 }, ''],
      ['', 'Harapan Tgl Pemotongan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanAc(permintaan) {
    let kerusakan = permintaan.permintaan.perbaikan.map((v, i, a) => {
      return (a.length > 1 ? (i + 1) + ". " : '') + v.jenis
    })
    let alamat = permintaan.permintaan.alamat;
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Lokasi AC', ':', { content: (alamat[0].toUpperCase() + alamat.substring(1)), colSpan: 3 }, ''],
      ['', 'Kerusakan', ':', { content: kerusakan.join('\n\n'), colSpan: 3 }, ''],
      ['', 'Harapan Tgl Pemotongan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanAtk(permintaan) {
    let tableFurniture: UserOptions = {
      theme: 'grid',
      body: [
        [{ content: 'No', styles: { fontStyle: 'bold' } }, { content: 'Nama ATK', styles: { fontStyle: 'bold' } }, { content: 'Jumlah', styles: { fontStyle: 'bold' } }, { content: 'Satuan', styles: { fontStyle: 'bold' } }],
        ...permintaan.permintaan.atk.map((atk, i) => {
          return [i + 1, atk.nama, atk.jumlah, atk.satuan]
        })
      ],
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
      }
    }
    let alamat = permintaan.permintaan.alamat;
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Lokasi Kerja', ':', { content: alamat[0].toUpperCase() + alamat.substring(1), colSpan: 3 }, ''],
      ['', { content: '', title: 'atk', colSpan: 5 }, ''],
      ['', 'Tgl Diperlukan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];

    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(
      perihal,
      [...header, ...content, ...footer],
      [
        { table: tableFurniture, cellTitle: 'atk' },
      ]);
  }

  generatePermintaanSnack(permintaan) {
    var perihalkeys = Object.keys(permintaan.permintaan.perihal);
    let perihal = permintaan.kategori.nama.replace(/[\r\n]/gm, '') + '/' + perihalkeys.filter((key) => permintaan.permintaan.perihal[key] === true).map(v => this._capitalize.transform(v.replace(/_+/g, ' '))).join('/');
    let alamat = permintaan.permintaan.tempat
    let content = [
      ['', 'Perihal', ':', { content: 'Permintaan ' + perihal, colSpan: 3 }, ''],
      ['', 'Tempat', ':', { content: alamat[0].toUpperCase() + alamat.substring(1), colSpan: 3 }, ''],
      ['', 'Tanggal', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      // TODO: waktu masih belum tersedia di database
      ['', 'Waktu', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }), colSpan: 3 }, ''],
      ['', 'Pengambilan', ':', { content: this._capitalize.transform(permintaan.permintaan.pengambilan), colSpan: 3 }, ''],
      ['', 'Cost Center', ':', { content: permintaan.permintaan.costCenter, colSpan: 3 }, ''],
      ['', 'Cost Center', ':', { content: permintaan.permintaan.GLAccount, colSpan: 3 }, ''],
      ['', 'PIC Kegiatan', ':', { content: permintaan.permintaan.pic, colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanKrp(permintaan) {
    let tempatPenjemputan = permintaan.permintaan.tempatPenjemputan
    let tempatTujuan = permintaan.permintaan.tempatTujuan
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Tanggal Keberangkatan', ':', { content: new Date(permintaan.permintaan.tglKeberangkatan).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Tanggal Kembali', ':', { content: new Date(permintaan.permintaan.tglKembali).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Tempat Penjemputan', ':', { content: tempatPenjemputan[0].toUpperCase() + tempatPenjemputan.substring(1), colSpan: 3 }, ''],
      ['', 'Tempat Tujuan', ':', { content: tempatTujuan[0].toUpperCase() + tempatTujuan.substring(1), colSpan: 3 }, ''],
      ['', 'Waktu Penjemputan', ':', { content: new Date(permintaan.permintaan.waktuPenjemputan).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }), colSpan: 3 }, ''],
      ['', 'Jenis Pelayanan', ':', { content: this._capitalize.transform(permintaan.permintaan.jenisPelayanan), colSpan: 3 }, ''],
      ['', 'Jumlah Penumpang', ':', { content: permintaan.permintaan.jumlahPenumpang, colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanMess(permintaan) {
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Nama Tamu', ':', { content: permintaan.permintaan.penanggungJawab, colSpan: 3 }, ''],
      ['', 'Jumlah Tamu', ':', { content: permintaan.permintaan.jumlahTamu + ' Orang', colSpan: 3 }, ''],
      ['', 'Jumlah Kamar', ':', { content: permintaan.permintaan.jumlahKamar + ' Kamar', colSpan: 3 }, ''],
      ['', 'Tgl Check-in', ':', { content: new Date(permintaan.permintaan.checkIn).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Tgl Check-out', ':', { content: new Date(permintaan.permintaan.checkOut).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanDokumen(permintaan) {
    let alamatPengirim = permintaan.permintaan.alamatPengirim
    let alamatPenerima = permintaan.permintaan.alamatPenerima
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Nama Pengirim', ':', { content: permintaan.permintaan.namaPengirim, colSpan: 3 }, ''],
      ['', 'Alamat Pengirim', ':', { content: alamatPengirim[0].toUpperCase() + alamatPengirim.substring(1), colSpan: 3 }, ''],
      ['', 'No Tlp Pengirim', ':', { content: permintaan.permintaan.noTlpPengirim, colSpan: 3 }, ''],
      ['', 'Nama Penerima', ':', { content: permintaan.permintaan.namaPenerima, colSpan: 3 }, ''],
      ['', 'Alamat Penerima', ':', { content: alamatPenerima[0].toUpperCase() + alamatPenerima.substring(1), colSpan: 3 }, ''],
      ['', 'No Tlp Penerima', ':', { content: permintaan.permintaan.noTlpPenerima, colSpan: 3 }, ''],
      ['', 'Jenis Dokumen', ':', { content: permintaan.permintaan.jenisDokumen, colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanGalon(permintaan) {
    let lokasi = permintaan.permintaan.lokasi
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Jumlah Galon', ':', { content: permintaan.permintaan.jumlah, colSpan: 3 }, ''],
      ['', 'Lokasi', ':', { content: lokasi[0].toUpperCase() + lokasi.substring(1), colSpan: 3 }, ''],
      ['', 'Tgl Diperlukan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Waktu Pengambilan', ':', { content: new Date(permintaan.permintaan.waktu).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }), colSpan: 3 }, ''],
      ['', 'Penis Pelayanan', ':', { content: this._capitalize.transform(permintaan.permintaan.jenisPelayanan), colSpan: 3 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];
    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(perihal, [...header, ...content, ...footer]);
  }

  generatePermintaanAcara(permintaan) {
    let tableKebutuhan: UserOptions = {
      theme: 'grid',
      body: [
        [
          { content: 'No', styles: { fontStyle: 'bold' } },
          { content: 'Nama Kebutuhan', styles: { fontStyle: 'bold' } },
          { content: 'Jumlah', styles: { fontStyle: 'bold' } },
          { content: 'Tgl Dibutuhkan', styles: { fontStyle: 'bold' } }
        ],
        ...permintaan.permintaan.kebutuhan.map((kebutuhan, i) => {
          return [i + 1, kebutuhan.nama, kebutuhan.jumlah + ' ' + kebutuhan.satuan, new Date(kebutuhan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })]
        })
      ],
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 28, halign: 'center' },
      }
    }
    let tempat = permintaan.permintaan.tempat;
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Nama Acara', ':', { content: permintaan.permintaan.nama, colSpan: 3 }, ''],
      ['', 'Jenis Acara', ':', { content: this._capitalize.transform(permintaan.permintaan.jenis), colSpan: 3 }, ''],
      ['', 'Cost Center', ':', { content: permintaan.permintaan.costCenter, colSpan: 3 }, ''],
      ['', 'GL Account', ':', { content: permintaan.permintaan.GLAccount, colSpan: 3 }, ''],
      ['', 'Tgl Pelaksanaan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Waktu Pelaksanaan', ':', { content: new Date(permintaan.permintaan.waktu).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }), colSpan: 3 }, ''],
      ['', 'Lokasi Acara', ':', { content: tempat[0].toUpperCase() + tempat.substring(1), colSpan: 3 }, ''],
      ['', 'Jumlah Peserta', ':', { content: permintaan.permintaan.jumlah, colSpan: 3 }, ''],
      ['', 'PIC Acara', ':', { content: permintaan.permintaan.pic, colSpan: 3 }, ''],
      ['', 'No Tlp PIC', ':', { content: permintaan.permintaan.noTlpPic, colSpan: 3 }, ''],
      ['', { content: '', title: 'kebutuhan', colSpan: 5 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No Tlp Requester', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];

    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(
      perihal,
      [...header, ...content, ...footer],
      [
        { table: tableKebutuhan, cellTitle: 'kebutuhan' },
      ]);
  }

  generatePermintaanPeralatan(permintaan) {
    let tablePeralatan: UserOptions = {
      theme: 'grid',
      body: [
        [
          { content: 'No', styles: { fontStyle: 'bold' } },
          { content: 'Nama Peralatan', styles: { fontStyle: 'bold' } },
          { content: 'Jumlah', styles: { fontStyle: 'bold' } },
          { content: 'Satuan', styles: { fontStyle: 'bold' } }
        ],
        ...permintaan.permintaan.peralatan.map((peralatan, i) => {
          return [i + 1, peralatan.nama, peralatan.jumlah, peralatan.satuan + (peralatan.nama == 'Lampu' ? ' Watt' : '')]
        })
      ],
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
      }
    }
    let alamat = permintaan.permintaan.alamat;
    let perihal = 'Permintaan ' + permintaan.kategori.nama.replace(/[\r\n]/gm, '')
    let content = [
      ['', 'Perihal', ':', { content: perihal, colSpan: 3 }, ''],
      ['', 'Lokasi Kerja', ':', { content: alamat[0].toUpperCase() + alamat.substring(1), colSpan: 3 }, ''],
      ['', 'Tgl Diperlukan', ':', { content: new Date(permintaan.permintaan.tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', { content: '', title: 'peralatan', colSpan: 5 }, ''],
      ['', 'Catatan', ':', { content: permintaan.permintaan.catatan, colSpan: 3 }, ''],
      ['', 'No Tlp Requester', ':', { content: permintaan.user.kodeNoTlp + permintaan.user.noTlp, colSpan: 3 }, '']
    ];

    let header = this.generatePermintaanHeader(permintaan);
    let footer = this.generatePermintaanFooter(permintaan);

    return this.generate(
      perihal,
      [...header, ...content, ...footer],
      [
        { table: tablePeralatan, cellTitle: 'peralatan' },
      ]);
  }
}
