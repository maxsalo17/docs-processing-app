const imgTools = require('../components/OpenCVTools')

module.exports = async(buffer, mime) => {
    let preparedImage;
    let Img = imgTools();
    let image = Img.getImageFromBuffer(buffer);
    image = Img.getGrayImage(image);
    const grayImage = image.copy();
    image = Img.getBlurredImage(image);
    image = Img.getCannyImage(image);
    image = Img.getThresholdImage(image);
    let contour = Img.getImageContour(image);
    if (contour) {
        let warpedImage = Img.getWarpedImage(grayImage, Img.findCorners(contour))
        preparedImage = warpedImage
        preparedImage = Img.getBWImage(preparedImage);

    } else {
        preparedImage = grayImage;
        preparedImage = Img.getBWImage(preparedImage);
    }
    buffer = await Img.encode(mime, preparedImage);
    return buffer;
}