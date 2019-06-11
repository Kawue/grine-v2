import * as d3 from 'd3';

class ImageService {
  constructor() {
    this.colorScale = d3.scaleSequential(d3.interpolateMagma).domain([0, 1]);
  }

  /**
   * assigns colors to image points
   * @param imageData
   * return []
   */
  calculateColors(imageData) {
    for (let imagePoint in imageData) {
      if (imageData.hasOwnProperty(imagePoint)) {
        let intensity = imageData[imagePoint].intensity;
        if (imageData[imagePoint].selected) {
          intensity += 0.5;
        }
        imageData[imagePoint].color = this.colorScale(intensity);
      }
    }
    return imageData;
  }

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
