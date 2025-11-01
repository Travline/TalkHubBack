import express from 'express';
import { turso } from './core/db';

const app = express();
app.use(express.json());

app.listen(1591, () => {
    console.log("Starting server");
})

app.get('/ola', async (_req, res) => {
    let ola = await turso.execute("SELECT * FROM roles")
    console.log(ola);
    res.json(ola)
})