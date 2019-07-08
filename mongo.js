const mongoose = require('mongoose')

// käyttö:
// node mongo.js yourpassword "Arto Vihavainen" 040-1234556

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://jussikv:${password}@cluster0-yitev.mongodb.net/luetteloni?retryWrites=t`

mongoose.connect(url, { useNewUrlParser: true })

const contactSchema = new mongoose.Schema({
    name: String,
    number: Number
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 3) {
    // tulostetaan kontaktit
    console.log("tulostetaan kontaktit:")
    Contact.find({}).then(result => {
        result.forEach(contact => {
            console.log(contact.name + " " + contact.number)
        })
        console.log("valmis. suljetaan yhteys.");
        mongoose.connection.close()
    })
}

if (process.argv.length === 4) {
    console.log("mitä vittua??")
    console.log("tällästä tarjoot: ")
    console.log(process.argv)
    process.exit(1)
}

if (process.argv.length === 5) {
    console.log("lisätään kontakti kantaan")
    
    // const contact = new Contact({
    //     name: "Atlas Shrugged Man",
    //     number: 9
    // })

    const contact = new Contact({
        name: process.argv[3],
        number: process.argv[4]
    })

    console.log("lisättävä kontakti: ", contact)

    contact.save().then(response => {
        console.log('contact saved!');
        console.log('vastaus oli: ', response);
        mongoose.connection.close();
    })
}

if (process.argv.length > 5) {
    console.log("enpä tiedä. en tee mitään.")
    console.log("sontaa:")
    console.log(process.argv)
    process.exit(1)
}
