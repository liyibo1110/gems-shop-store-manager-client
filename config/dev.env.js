'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"http://127.0.0.1:11112"',
  IMAGE_BASE: '"http://47.92.25.226/"',
  VIDEO_BASE: '"http://123.57.26.211:82/"'
})
