# gatsby-source-cv3

This is a Gatsby Source Plugin that is used to access data from the CommerceV3 (CV3) ecommerce platform. Data is fetched from the CV3 REST API.

## Quick Start

Install and configure like you would most Gatsby plugins.

```shell
npm install gatsby-source-cv3
```

```js gatsby-config.js
  plugins: [
    {
      resolve: "gatsby-source-cv3",
      options: {
        rest_key: process.env.CV3_REST_KEY,
        rest_secret: process.env.CV3_REST_SECRET
      },
    },
  ],
```

In CV3 make sure your store has the REST API enabled for the sub-user you want to use to control access.
This user can get the REST KEY and REST SECRET from `Dashboard >> General Options`

## Status

Review the `src/schema.js` file to see what fields are available and where.

TODO:

- Products and SubProducts with Attributes
- Product with Kits
- Product shipping & taxes
- Gift Certificate Products
- Rewards Points
- Dependency products/dependency prods
- Image processing?
- Testing with larger data sets
- cache/skip unchanged data
- only fetch auth keys when needed

DONE:

- Regular Products
- Categories & SubCategories
- Products with SubProducts

## Contributing to this repo

1. Clone this repo, likely into a folder next to your gatsby project

2. Add this to your `gatsby-config.js` plugins section, adjusting for the path to the cloned repo and the location/values of your secret variables which you got from the CV3 Admin:

```
{
  resolve: require.resolve(`../gatsby-source-cv3`),
  options: {
    rest_key: process.env.CV3_REST_KEY,
    rest_secret: process.env.CV3_REST_SECRET
  }
}
```
