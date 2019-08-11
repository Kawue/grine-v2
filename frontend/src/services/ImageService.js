import * as d3 from 'd3';

class ImageService {
  /**
   * @param src
   * @returns {any}
   */
  jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
  }

  /**
   * assigns colors to image points
   * @param imageDataPassed
   * @param colorScale
   * return []
   */
  calculateColors(imageDataPassed, colorScale) {
    let colorScaleD3 = d3.scaleSequential(d3[colorScale]).domain([0, 1]);
    let imageData = this.jsonCopy(imageDataPassed);
    for (let imagePoint in imageData) {
      if (imageData.hasOwnProperty(imagePoint)) {
        let intensity = imageData[imagePoint].intensity;
        if (imageData[imagePoint].selected) {
          intensity += 0.5;
        }
        imageData[imagePoint].color = colorScaleD3(intensity);
      }
    }
    return imageData;
  }

  /*rgbToHex(rgb) {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = '0' + hex;
    }
    return hex;
  }

  fullColorHex(r, g, b, a) {
    let red = this.rgbToHex(r);
    let green = this.rgbToHex(g);
    let blue = this.rgbToHex(b);
    let trans = this.rgbToHex(a);
    return red + green + blue + trans;
  }

  calculatePcaColors(imageDataPassed) {
    let imageData = this.jsonCopy(imageDataPassed);
    for (let imagePoint in imageData) {
      if (imageData.hasOwnProperty(imagePoint)) {
        imageData[imagePoint].color =
          '#' +
          this.fullColorHex(
            imageData[imagePoint].r,
            imageData[imagePoint].g,
            imageData[imagePoint].b,
            255
          );
      }
    }
    console.log(imageData);
    return imageData;
  }*/

  /**
   * mark selected points
   * @param imageData
   * @param selectedPoints
   * @returns []
   */
  markSelectedPoints(imageData, selectedPoints) {
    imageData.forEach(point => {
      point.selected = false;
    });
    selectedPoints.forEach(point => {
      point.selected = true;
    });
    return imageData;
  }
}
export default ImageService;
