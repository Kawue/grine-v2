import * as d3 from 'd3';

class ImageService {
  constructor() {
    this.colorScale = d3
      .scaleLinear()
      .range(['white', '#69b3a2'])
      .domain([0, 1]);
  }

  /**
   * assigns colors to image points
   * @param imageData
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
   * marks image points as selected
   * @param imageData
   * @param selectedPoints
   * @returns imageData
   */
  markSelectedPoints(imageData, selectedPoints) {
    if (!selectedPoints.length) {
      for (let imagePoint in imageData) {
        if (imageData.hasOwnProperty(imagePoint)) {
          imageData[imagePoint].selected = false;
        }
      }
    } else {
      for (let imagePoint in imageData) {
        if (imageData.hasOwnProperty(imagePoint)) {
          imageData[imagePoint].selected = false;
        }
      }

      for (let imagePoint in selectedPoints) {
        if (selectedPoints.hasOwnProperty(imagePoint)) {
          imageData[imagePoint].selected = true;
        }
      }
    }

    //console.log(selectedPoints);
    //console.log(imageData);

    return imageData;

    /*if (!selectedPoints.length) {
  this.points.forEach(point => {
    point.color = this.getPointColor(point.intensity);
  });
} else {
  this.points.forEach(point => {
    point.color = this.getPointColor(point.intensity - 20);
  });
  selectedPoints.forEach(point => {
    point.color = this.getPointColor(point.intensity + 20);
  });
}
this.drawPoints();*/



  }

}
export default ImageService;
