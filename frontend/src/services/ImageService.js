import * as d3 from 'd3';
import * as _ from 'lodash';

class ImageService {
  /**
   * assigns colors to image points
   * @param imageDataPassed
   * @param colorScale
   * return []
   */
  calculateColors(imageDataPassed, colorScale) {
    let colorScaleD3 = d3.scaleSequential(d3[colorScale]).domain([0, 1]);
    let imageData = _.cloneDeep(imageDataPassed);
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
