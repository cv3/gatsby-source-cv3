var axios = require('axios')

// Get Product Data
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
