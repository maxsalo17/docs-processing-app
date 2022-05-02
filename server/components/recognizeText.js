const { createWorker } = require('tesseract.js');
const Tesseract = require('tesseract.js')

module.exports = async(image, lang) => {
    const worker = createWorker({
        logger: m => console.log(m.progress)
    });

    const data = await (async() => {
        await worker.load();
        await worker.loadLanguage('eng+ukr');
        await worker.initialize('eng+ukr', Tesseract.OEM.TESSERACT_LSTM_COMBINED);
        console.log("Recognizing...");
        const { data } = await worker.recognize(image);
        await worker.terminate();
        return data;
    })();

    return data;
}