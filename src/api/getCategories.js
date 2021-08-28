var axios = require('axios')

// Get Category data
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
            top_level_only: true,
            export_by_range: {
              start: 1,
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
