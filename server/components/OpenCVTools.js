const cv = require('opencv4nodejs');
const mime = require('mime-types')
var fs = require('fs');



module.exports = () => {
    let dir = './log_images/' + Date.now().toString();
    fs.mkdirSync(dir)

    function writeImage(type, image) {
        cv.imwriteAsync(dir + '/' + type + '.jpg', image)
    }
    return {
        getImageFromBuffer: (buffer) => {
            let image = cv.imdecode(buffer);
            image = image.rescale(2.0)
            writeImage('original', image);
            return image
        },
        getGrayImage: (image) => {
            image = image.bgrToGray()
            writeImage('grayScale', image);
            return image
        },
        getBlurredImage: (image) => {
            let ksize = new cv.Size(3, 3);
            image = cv.gaussianBlur(image, ksize, 1, 1, cv.BORDER_DEFAULT);
            writeImage('blurred', image);
            return image
        },
        getCannyImage: (image) => {
            image = image.canny(50, 100, 3, false)
            writeImage('canny', image);
            return image
        },
        getThresholdImage: (image) => {
            const kernel = new cv.Mat(5, 5, cv.CV_8U);
            let anchor = new cv.Point(-1, -1);
            let tresholdImage = image.dilate(kernel, anchor, 2)
            image = tresholdImage.erode(kernel, anchor, 1)
            writeImage('threshhold', image);
            return image
        },
        getImageContour: (image) => {
            let contours = image.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
            contours = contours.sort((c0, c1) => c1.area - c0.area);
            contour = contours[0];
            const peri = contour.arcLength(true)
            let approx = contour.approxPolyDP(0.02 * peri, true);
            if (approx.length === 4) {
                return approx
            } else {
                return;
            }

        },
        getWarpedImage: (image, { tl, tr, bl, br }) => {
            //Calculate the max width/height
            let widthBottom = Math.hypot(br.corner.x - bl.corner.x, br.corner.y - bl.corner.y);
            let widthTop = Math.hypot(tr.corner.x - tl.corner.x, tr.corner.y - tl.corner.y);
            let theWidth = (widthBottom > widthTop) ? widthBottom : widthTop;
            let heightRight = Math.hypot(tr.corner.x - br.corner.x, tr.corner.y - br.corner.y);
            let heightLeft = Math.hypot(tl.corner.x - bl.corner.x, tr.corner.y - bl.corner.y);
            let theHeight = (heightRight > heightLeft) ? heightRight : heightLeft;

            //Transform!
            let finalDestCoords = [new cv.Point2(0, 0), new cv.Point2(theWidth - 1, 0), new cv.Point2(theWidth - 1, theHeight - 1), new cv.Point2(0, theHeight - 1)]
            let srcCoords = [tl.corner, tr.corner, br.corner, bl.corner];
            let dsize = new cv.Size(theWidth, theHeight);
            let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)
            image = image.warpPerspective(M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT);
            writeImage('warped', image);
            return image
        },
        findCorners: (contour) => {
            //Find the corners
            //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
            let corner1 = contour[0];
            let corner2 = contour[1];
            let corner3 = contour[2];
            let corner4 = contour[3];

            //Order the corners
            let cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
            //Sort by Y position (to get top-down)
            cornerArray.sort((item1, item2) => { return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; }).slice(0, 5);

            //Determine left/right based on x position of top and bottom 2
            let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
            let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
            let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
            let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];

            return { tl, tr, bl, br }
        },
        getBWImage: (image) => {
            image = image.threshold(155, 255, cv.THRESH_BINARY)
            writeImage('BW', image)
            return image
        },
        show: (name, image) => {
            cv.imshow(name, image);
        },
        wait: () => {
            cv.waitKey();
        },
        write: (path, image) => {
            return cv.imwriteAsync(path, image)
        },
        encode: (mimetype, image) => {
            let ext = mime.extension(mimetype);
            return cv.imencodeAsync('.' + ext, image)
        }
    }
}