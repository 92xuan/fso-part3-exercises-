const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  console.log(process.argv)
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://nigelmakesmusic_db_user:${password}@cluster0.gq4r3ih.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const main = async () => {
    try {
        await mongoose.connect(url, { family: 4 })
        if (process.argv.length === 5) { // Create new contact
            const person = new Person ({
                name: process.argv[3], 
                number: process.argv[4]
            })

            await person.save().then(result => {
                console.log(`Added ${process.argv[3]} (Number: ${process.argv[4]})to phonebook`)
            })
        } else if (process.argv.length === 3) { // Retrieve all existing contacts
            await Person.find({}).then(
                result => {
                    result.forEach(note => {
                    console.log(note)})
            })
        }}
    catch (error) {console.error('Error', error)}
    finally {await mongoose.connection.close()}
}

main()