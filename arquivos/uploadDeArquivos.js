const fs = require('fs')

fs.createReadStream('./assets/estrela.jpg')
    .pipe(fs.createWriteStream('./assets/estrela-stream.jpg'))
    .on('finish', () => console.log('Imagem foi escrita com sucesso'))