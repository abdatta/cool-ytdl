import * as express from 'express';
import * as hbs from 'hbs';
import * as ytdl from 'ytdl-core';
import { spawn } from 'child_process';

const app = express()
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/options', (req, res) => {
    const link = req.query.link;
    ytdl.getInfo(link, (err, info) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        // res.json(info);
        // res.json(info.formats.map(i => ({...i, url: undefined})));
        info.formats.forEach(f => f.codecs = f.codecs.split('.')[0]);
        const audio_videos = info.formats.filter(i => i.mimeType.startsWith('video') && i['audioBitrate']);
        const only_videos = info.formats.filter(i => i.mimeType.startsWith('video') && !(i['audioBitrate']));
        const only_audios = info.formats.filter(i => i.mimeType.startsWith('audio'));
        res.render('options', { title: info.title, link: encodeURIComponent(link), audio_videos, only_videos, only_audios });
      });
})

app.get('/download', (req, res) => {
    const link = req.query.link;
    const itag = req.query.itag;
    if (!(link && itag)) {
        res.sendStatus(400); // Bad Request;
        return;
    }
    ytdl(link, {quality: itag}).pipe(res);
});

app.get('/merge', (req, res) => {
    const link = req.query.link;
    const audio_itag = req.query.a_itag;
    const video_itag = req.query.v_itag;

    if (!(link && audio_itag && video_itag)) {
        res.sendStatus(400); // Bad Request;
        return;
    }

    const options = ["-i",`http://localhost:4000/download?link=${encodeURIComponent(link)}&itag=${video_itag}`,"-i",`http://localhost:4000/download?link=${encodeURIComponent(link)}&itag=${audio_itag}`,"-map","0","-map","1","-c","copy","-f", "matroska", "pipe:1"];
    const output = spawn('ffmpeg', options);
    console.log('\nffmpeg', ...options, '\n');

    output.stderr.pipe(process.stdout);
    output.stdout.pipe(res);

    output.on('exit', (code) => console.log(`ffmpeg exited with code ${code}\n`));
});
 
app.listen(4000);
