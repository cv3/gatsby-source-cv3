var axios = require('axios')
var qs = require('qs')

// Step One: Use OAuth to get a token for use with the API endpoint
// TODO: Runs every time, change to only run if we don't already have
//       a good one, they are good for one hour.
exports.getCategories = async ({ token_categories }) => {
  try {
    api_result = await axios.request({
      baseURL: 'https://service.commercev3.com/rest',
      url: 'categories',
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token_categories,
      },
      data: {
        data: {
          exportCategories: {
            top_level_only: false,
          },
        },
      },
    })
  } catch (err) {
    console.log('CV3 ERROR')
    console.log(err)
  }

  //console.log(api_result.data)
  return api_result
}
