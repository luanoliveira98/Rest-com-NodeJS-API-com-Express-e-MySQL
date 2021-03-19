const fs = require('fs')

fs.readFile('./assets/estrela.jpg', (erro, buffer) => {
    console.log('imagem foi bufferizada')
    console.log(buffer)

    fs.writeFile('./assets/estrela2.jpg', buffer, (erro) => {
        console.log('imagem foi escrita')
    })
})