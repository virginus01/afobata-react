import express from 'express'
import next from 'next'

const port = parseInt(process.env.PORT, 10) || 3000
const hostname = '127.0.0.1'
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, (err) => {
        if (err) {
            console.error(err)
            return;
        }

        console.info(`> Live on http://localhost:${port}`)
    })
})
