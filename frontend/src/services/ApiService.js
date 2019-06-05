import testData from '../data/test_new_json';
//import testData from '../data/0.70854_barley';

class ApiService {
  fetchData() {
    console.log('fetching data');
    return testData;
  }
}
export default ApiService;
