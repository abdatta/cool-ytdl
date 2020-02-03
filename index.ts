import * as express from 'express';
import * as hbs from 'hbs';
import * as ytdl from 'ytdl-core';

const app = express()
app.set('view engine', 'hbs');
 
app.get('/', (req, res) => {
    const link = req.query.link;
    ytdl.getInfo(link, (err, info) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        // res.json(info);
        // res.json(info.formats.map(i => ({...i, url: undefined})));
        const audio_videos = info.formats.filter(i => i.mimeType.startsWith('video') && i['audioBitrate']);
        const only_videos = info.formats.filter(i => i.mimeType.startsWith('video') && !(i['audioBitrate']));
        const only_audios = info.formats.filter(i => i.mimeType.startsWith('audio'));
        res.render('options', { title: info.title, link: encodeURIComponent(link), audio_videos, only_videos, only_audios });
      });
})

app.get('/download', (req, res) => {
    const link = req.query.link;
    const itag = req.query.itag;
    ytdl(link, {quality: itag}).pipe(res);
});
 
app.listen(4000)