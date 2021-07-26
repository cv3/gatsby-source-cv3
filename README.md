# gatsby-source-cv3

This is a Gatsby Source Plugin to access data from the CommerceV3 (CV3) ecommerce platform.

## Status

This is early software under heavy development, do not use.

## Quick Start

1) Clone this repo, likely into a folder next to your gatsby project

2) Add this to your `gatsby-config.js` plugins section, adjusting for the path to the cloned repo and the location/values of your secret variables which you got from the CV3 Admin:

```
{
  resolve: require.resolve(`../gatsby-source-cv3`),
  options: {
    rest_key: process.env.CV3_REST_KEY,
    rest_secret: process.env.CV3_REST_SECRET
  }
}
```