var axios = require('axios')

// CV3 product's export_by_range includes sub-products,
// so first we want to just request SKUs... we'll get the
// right relationship between products & sub-products.
exports.getSKUs = async ({ token_products }) => {
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
            export_sku_only: true,
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
