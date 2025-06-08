const { EventEmitter } = require('events');

function escapeText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

class PDFDocument extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.marginLeft = opts.margin || 40;
    this.y = 750;
    this.fontSizeVal = 12;
    this.ops = [];
  }

  fontSize(size) {
    this.fontSizeVal = size;
    return this;
  }

  text(txt) {
    const line = `BT /F1 ${this.fontSizeVal} Tf ${this.marginLeft} ${this.y} Td (${escapeText(txt)}) Tj ET`;
    this.ops.push(line);
    this.y -= this.fontSizeVal * 1.2;
    return this;
  }

  moveDown(lines = 1) {
    this.y -= this.fontSizeVal * 1.2 * lines;
    return this;
  }

  image() {
    // images not supported in minimal implementation
    return this;
  }

  end() {
    const content = this.ops.join('\n');
    const objects = [];
    const offsets = [];
    let pos = 9; // length of %PDF-1.4\n
    function add(obj) {
      offsets.push(pos);
      pos += Buffer.byteLength(obj) + 1; // newline
      objects.push(obj);
    }

    add('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
    add('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
    add('3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj');
    add('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
    add(`5 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream endobj`);

    const xrefPos = pos;
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    offsets.forEach(o => {
      xref += String(o).padStart(10, '0') + ' 00000 n \n';
    });

    const trailer = `trailer << /Root 1 0 R /Size 6 >>\nstartxref\n${xrefPos}\n%%EOF`;
    const pdf = `%PDF-1.4\n${objects.join('\n')}\n${xref}${trailer}`;
    this.emit('data', Buffer.from(pdf, 'utf8'));
    this.emit('end');
  }
}

module.exports = PDFDocument;
