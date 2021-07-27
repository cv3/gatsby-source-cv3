var axios = require('axios')
var qs = require('qs')

// Step One: Use OAuth to get a token for use with the API endpoint
// TODO: Runs every time, change to only run if we don't already have
//       a good one, they are good for one hour.
exports.getProducts = async ({ token_products }) => {
  try {
    api_result = await axios.request({
      baseURL: 'https://service.commercev3.com/rest',
      url: 'products',
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token_products,
      },
      data: {
        data: {
          exportProducts: {
            export_by_range: {
              start: 1,
              end: 10000,
              limit: 1000,
            },
          },
        },
      },
    })
  } catch (err) {
    console.log('CV3 ERROR')
    console.log(err)
  }

  return api_result
}
