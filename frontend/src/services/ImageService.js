import * as d3 from 'd3';

class ImageService {
  constructor() {
    this.colorScale = d3
      .scaleLinear()
      .range(['white', '#69b3a2'])
      .domain([0, 1]);
  }

  /**
   * copies passed object, returns object with colors assigned
   * @param originalImageData
   */
  setColorFromIntensity2(originalImageData) {
    let imageData = {};
    for (let mzValue in originalImageData) {
      if (originalImageData.hasOwnProperty(mzValue)) {
        imageData[mzValue] = originalImageData[mzValue];

        for (let imagePoint in imageData[mzValue]) {
          if (imageData[mzValue].hasOwnProperty(imagePoint)) {
            imageData[mzValue][imagePoint].color = this.colorScale(
              imageData[mzValue][imagePoint].intensity
            );
          }
        }
      }
    }
    return imageData;
  }

  setColorFromIntensity(imageData) {
    for (let imagePoint in imageData) {
      if (imageData.hasOwnProperty(imagePoint)) {
        imageData[imagePoint].color = this.colorScale(
          imageData[imagePoint].intensity
        );
      }
    }
    return imageData;
  }

  /*markSelectedPoints(imageData, selectedPoints) {


    for (let imagePoint in imageData) {
      if (imageData.hasOwnProperty(imagePoint)) {
        imageData[imagePoint].color = this.colorScale(
          imageData[imagePoint].selected = true
        );
      }
    }
    return imageData;


  }*/

}
export default ImageService;
