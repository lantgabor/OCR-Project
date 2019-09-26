const express = require('express');
const app = express();

const fs = require('fs');
const multer = require('multer');

const {TesseractWorker} = require('tesseract.js')
const worker = new TesseractWorker();


const storage = multer.diskStorage({
    destination: (req, file, cb) => { // res is file
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('avatar');
app.set('view engine', 'ejs');

// TODO: move to different folders
// routes

app.get('/',(req,res)=>{
    res.render('index.ejs');
});

app.post('/upload', (req,res)=>{
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log('ERROR:', err);

           worker
            .recognize(data, 'eng', { tessjs_create_pdf: '1' })
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
                // res.send(result.text);
                res.redirect('/download')
            })
            .finally( () => worker.terminate());
        });
    });
});

app.get('/download', (req,res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

// Start and listen
const PORT = 5000 || process.env.PORT; //auto port
app.listen(PORT, ()=>{console.log(`server running on port ${PORT}`)});