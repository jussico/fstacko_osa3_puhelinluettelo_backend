require('dotenv').config()
const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const morgan = require('morgan')

const Contact = require('./models/contact')

// app.use(morgan('tiny'))
// app.use(morgan('morgan-body'))   // tarvii requiren?
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
// ei toimi morgan.token('responseBody', function (req, res) { return JSON.stringify(res.body) });
app.use(morgan(':method :url :status :req[content-length] :response-time ms - :res[content-length] :body'));

// TODO: onko näiden järjestyksellä väliä?
const cors = require('cors')
app.use(cors())

const helloText = 'hello July!'

app.get('/', (req, res, next) => {
    res.send(`<h1>${helloText}</h1>`)
})

// INFO
app.get('/info', (req, res, next) => {
    Contact.find({}).then(result => {
        const infoSivu = `Phonebook has info for ${result.length} people<br> ${new Date()}<br>`
        res.send(infoSivu)
    })
})

// LISTA
app.get('/persons', (req, res, next) => {
    Contact.find({}).then(contacts => {
        res.json(contacts)
    })
        .catch(error => {
            console.log(error);
            res.status(404).end()
        })
})

// GET ONE
app.get('/persons/:id', (request, response, next) => {
    Contact.findById(request.params.id)
        .then(contact => {
            if (contact) {
                response.json(contact.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// DELETE ONE
app.delete('/persons/:id', (request, response, next) => {
    Contact.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// UPDATE ONE
app.put('/persons/:id', (request, response, next) => {

    const body = request.body

    const contact = {
        name: body.name,
        number: body.number
    }

    Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
        .then(updatedContact => {
            response.json(updatedContact.toJSON())
        })
        .catch(error => next(error))
})

const generateId = () => {
    // const maxId = persons.length > 0
    //     ? Math.max(...persons.map(n => n.id))
    //     : 0
    // return maxId + 1
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

// ADD ONE
app.post('/persons', (request, response, next) => {

    const body = request.body

    const contact = new Contact({
        name: body.name,
        number: body.number,
        id: generateId()
    })

    contact.save().then(savedContact => {
        response.json(savedContact.toJSON())
    })
    .catch(error => next(error))

    // old hand-coded data validation check-code in all.
    // {
    //     let message = ''
    //     const noName = (body.name === undefined)
    //     const noNumber = body.number === undefined
    //     if (noName) message = message.concat('no name! ')
    //     if (noNumber) message = message.concat('no number! ')
    //     if (!noNumber && !noName) {
    //         Contact.find({}).then(contacts => {
    //             if (contacts.find(contact => contact.name == body.name)) {
    //                 message = message.concat('name exists! ')
    //             }

    //             if ('' !== message) {
    //                 console.log("can't add because: ", message)
    //                 return response.status(400).json({
    //                     error: message
    //                 })
    //             }

    //             const contact = new Contact({
    //                 name: body.name,
    //                 number: body.number,
    //                 id: generateId()
    //             })

    //             contact.save().then(savedContact => {
    //                 response.json(savedContact.toJSON())
    //             })
    //             .catch(error => next(error))

    //         })
    //             .catch(error => {
    //                 console.log(error);
    //                 response.status(404).end()
    //             })
    //     }
    // }
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
