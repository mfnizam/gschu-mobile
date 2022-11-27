import { Injectable } from '@angular/core';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {


  constructor() { }



  // TODO: Move to helper
  async generate(options: {
    noSurat: string,
    tglPermintaan: Date,
    wilayahKerja: string,
    fungsi: string,
    perihal: string,
    alamat: string,
    namaRequester: string,
    jabatanRequester: string,
    namaAtasan?: string,
    jabatanAtasan?: string,
    namaPenyetuju: string,
    jabatanPenyetuju: string
  }) {
    const doc = new jsPDF({ format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    let body: UserOptions['body'] = [
      [{ content: '', colSpan: 7, title: 'linetop' }],
      ['', { content: 'FORM PERBAIKAN RDP & FASUM', colSpan: 3, styles: { fontStyle: 'bold', fontSize: 14 } }, { content: '', rowSpan: 2, colSpan: 2 }, ''],
      ['', { content: 'PT PERTAMINA HULU ROKAN ZONA 1', colSpan: 3 }, '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', 'No. Surat', ':', { content: options.noSurat, colSpan: 3 }, ''],
      ['', 'Tanggal', ':', { content: options.tglPermintaan.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 3 }, ''],
      ['', 'Kepada', ':', { content: 'SCM ' + options.wilayahKerja, colSpan: 3 }, ''], // ganti kata scm sesuai data wilayah kerja
      ['', 'Dari', ':', { content: options.fungsi, colSpan: 3 }, ''],
      [{ content: '', colSpan: 7, title: 'linebottom' }],
      [{ content: '', colSpan: 7, title: 'gap' }],
      [{ content: '', colSpan: 7, title: 'linetop' }],
      ['', 'Perihal', ':', { content: 'Permintaan ' + options.perihal.replace(/[\r\n]/gm, ''), colSpan: 3 }, ''],
      ['', 'Alamat RDP/Fasum', ':', { content: options.alamat[0].toUpperCase() + options.alamat.substring(1), colSpan: 3 }, ''],
      ['', 'Jenis Kerusakan', ':', { content: 'Perbaikan Atap', colSpan: 3 }, ''],
      ['', 'Harapan Tgl Perbaikan', ':', { content: 'Rabu 23 November 2022', colSpan: 3 }, ''],
      ['', 'No HP', ':', { content: '082334776556', colSpan: 3 }, ''],
      [{ content: '', colSpan: 7 }],
      ['', { content: 'Demikian disampaikan atas perhatiannya terimakasih.', colSpan: 5 }, ''],
      [{ content: '', colSpan: 7 }],
      ['', { content: options.tglPermintaan.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), colSpan: 5 }, ''],
      ['', { content: 'Dibuat Oleh,', styles: { halign: 'center' } }, '', { content: options.namaAtasan ? 'Diketahui Oleh,' : '', styles: { halign: 'center' } }, '', { content: 'Disetujui Oleh,', styles: { halign: 'center' } }, ''],
      [{ content: '', colSpan: 7, title: 'gap-ttd', styles: { minCellHeight: 35 } }],
      ['', { content: options.namaRequester, styles: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold' } }, '', { content: options.namaAtasan || '', styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: options.namaPenyetuju, styles: { halign: 'center', fontStyle: 'bold' } }, ''],
      ['', { content: options.jabatanRequester, styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: options.jabatanAtasan || '', styles: { halign: 'center', fontStyle: 'bold' } }, '', { content: options.jabatanPenyetuju, styles: { halign: 'center', fontStyle: 'bold' } }, ''],

      [{ content: '', colSpan: 7, title: 'linebottom' }],
    ]

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
      willDrawCell: (data) => {

        data.doc.setDrawColor("#000");
        let title = data.row.raw[data.column.index]?.title;
        let rowLength = Math.max.apply(null, Object.keys(data.row.cells));
        if (data.row.index === 1 && data.column.index == rowLength) {
          data.doc.addImage('assets/icon/logo_pdf.png', data.cursor.x - 50, data.cursor.y, 50, 13.72);
        }

        if (data.column.index == 0 && title !== 'gap') data.doc.line(data.cursor.x, data.cursor.y, data.cursor.x, data.cursor.y + data.cell.height);
        if (data.column.index == rowLength && title !== 'gap') data.doc.line(data.cursor.x + data.cell.width, data.cursor.y, data.cursor.x + data.cell.width, data.cursor.y + data.cell.height);

        if (!title) return;

        if (title.includes('line')) {
          let topOrBottom = title == 'linebottom' ? data.cell.height : 0
          data.doc.line(data.cursor.x, data.cursor.y + topOrBottom, data.cursor.x + data.cell.width, data.cursor.y + topOrBottom);
        }

        if (title == 'gap') data.row.height = 4;
      },
    })

    window.open(doc.output('bloburl'))
  }
}
