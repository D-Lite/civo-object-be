const express = require('express')
    const app = express()
    const port = 3000

    app.get('/', (req, res) => res.json({ message: 'Hello World!' }))

    app.listen(port, () => console.log(`This is the beginning of the Node File Upload App`))