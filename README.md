## Description

Source data for your Gatsby sites from [CV3](https://CommerceV3.com).

### Dependencies

This is a [Gatsby](https://www.gatsbyjs.com/) Source Plugin and requires nothing extra to run. However, you'll likely want to use other plugins as starters and to access the shopping APIs.

## How to install

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

## Available options

Currently the `rest_key` and the `rest_secret` are the only options, and they are required.

## When do I use this plugin?

Use this plugin when creating sites with [Gatsby](https://www.gatsbyjs.com/) that need to source e-commerce
data from CV3.

## How to develop locally

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

## How to contribute

Contact us via Github or directly with questions, suggestions or help.

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
