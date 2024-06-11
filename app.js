const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/formats', async (req, res) => {
    const url = req.query.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid URL');
    }

    try {
        const info = await ytdl.getInfo(url);
        const formats = info.formats;
        res.json(formats);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/api/download', (req, res) => {
    const url = req.query.url;
    const format = req.query.format;

    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid URL');
    }

    res.header('Content-Disposition', `attachment; filename="video.${format.container}"`);
    ytdl(url, { format: ytdl.chooseFormat(info.formats, { quality: format.itag }) }).pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
