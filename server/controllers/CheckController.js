const fs = require("fs");
const recognizeText = require('../components/recognizeText')
const prepareImage = require('../components/prepareImage')
const regexps = require('../components/regexps')

class CheckController {
    static async postNewCheckPhoto(req, res) {
        try {
            let b64 = req.body.photo;
            let mime = req.body.mime;
            if (!b64) return res.status(400).send()
            let buffer = Buffer.from(b64, 'base64')
            buffer = await prepareImage(buffer, mime);
            let data = await recognizeText(buffer, req.body.lang);
            let text = data.text;
            let matches = text.match(regexps.receipt_id)
            console.log(matches)
            console.log(text)
            if (matches && matches.length > 0) {
                res.status(200).send({
                    success: true,
                    type: 'RECEIPT_ID',
                    data: matches[0]
                });
            } else {
                res.status(400).send({
                    success: true,
                    type: 'RECEIPT_ID_NOT_DETECTED',
                    error: 'Неможливо розпізнати код квитанції. Спробуйте інше фото або скан квитанції.'
                });
            }

        } catch (e) {
            console.log(e);
            res.status(500).send({
                success: true,
                type: 'INTERNAL_SERVER_ERROR',
                error: 'На сервері сталась помилка. Спробуйте ще раз.'
            });
        }
    }

}

module.exports = CheckController;