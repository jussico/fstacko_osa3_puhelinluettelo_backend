const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const morgan = require('morgan')
// app.use(morgan('tiny'))
// app.use(morgan('morgan-body'))   // tarvii requiren?
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });
// ei toimi morgan.token('responseBody', function (req, res) { return JSON.stringify(res.body) });
app.use(morgan(':method :url :status :req[content-length] :response-time ms - :res[content-length] :body'));

// TODO: onko näiden järjestyksellä väliä?
const cors = require('cors')
app.use(cors())

const helloText = 'hello July!'

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/', (req, res) => {
    res.send(`<h1>${helloText}</h1>`)
})

const infoSivu =
    `Phonebook has info for ${persons.length} people<br>
${new Date()}<br>`

app.get('/info', (req, res) => {
    res.send(infoSivu)
})

app.get('/persons', (req, res) => {
    res.json(persons)
})

app.get('/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateId = () => {
    // const maxId = persons.length > 0
    //     ? Math.max(...persons.map(n => n.id))
    //     : 0
    // return maxId + 1
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.post('/persons', (request, response) => {

    const body = request.body

    // data validation checks
    {
        let message = ''
        const noName = ( body.name === undefined )
        const noNumber = body.number === undefined
        if(noName) message = message.concat('no name! ')
        if(noNumber) message = message.concat('no number! ')
        if(!noNumber && !noName && persons.find(person => person.name == body.name)) {
            message = message.concat('name exists! ')
        }
        if('' !== message) {
            console.log("can't add because: ", message)
            return response.status(400).json({
                error: message
            })            
        }
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    console.log(person)

    response.json(person)
})

// const PORT = 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
