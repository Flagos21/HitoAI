class Document {
  constructor(opts){this.opts = opts;}
}
const Packer = {
  toBuffer: async () => Buffer.from('')
};
class Paragraph { constructor(text){this.text = text;} }
const HeadingLevel = { HEADING_1:1, HEADING_2:2 };
class Table { constructor(opts){this.opts=opts;} }
class TableRow { constructor(opts){this.opts=opts;} }
class TableCell { constructor(opts){this.opts=opts;} }
class TextRun { constructor(text){this.text=text;} }
const Media = { addImage: () => null };
module.exports = { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, Media };
