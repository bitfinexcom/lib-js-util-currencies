/* eslint-disable camelcase */

'use strict'

const LRU = require('lru')

const EXPIRY_MEM_SECONDS = 150

class Currencies {
  constructor (redis) {
    this.redis = redis
    this.lru = new LRU({
      max: 1000,
      maxAge: EXPIRY_MEM_SECONDS * 1000
    })
  }

  get_cached (base, key, cb) {
    const lru = this.lru
    const chash = this._getKey(base, key)

    const res = lru.get(chash)
    if (res) {
      return cb(null, res)
    }

    this.redis.get(chash, (err, val) => {
      if (err) return cb(err)

      let res = null
      if (val) {
        res = JSON.parse(val)
      }

      lru.set(chash, res)

      cb(null, res)
    })
  }

  _getKey (base, key) {
    return base.toLowerCase() + ':' + key.toLowerCase()
  }

  set_cached (base, key, value, cb) {
    const chash = this._getKey(base, key)

    this.redis.set(chash, JSON.stringify(value), cb)
  }

  get_ccys (what, cb) {
    return this.get_cached('currency', what, cb)
  }

  fiat_currencies (cb) {
    return this.get_ccys('fiat_currencies', cb)
  }
}

module.exports = Currencies
