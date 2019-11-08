/* eslint-env mocha */

'use strict'

const assert = require('assert')
const Redis = require('ioredis')

const Currencies = require('..')

let redis = null
describe('basic integration', () => {
  before(function (done) {
    redis = new Redis()

    redis.set(
      'currency:usd',
      JSON.stringify({ info: 'much usd, much wow' }),
      done
    )
  })

  after(() => {
    redis.disconnect()
  })

  it('gets currencies', (done) => {
    const currencies = new Currencies(redis)

    currencies.get_ccys('USD', (err, res) => {
      if (err) throw err

      assert.strictEqual(res.info, 'much usd, much wow')
      done()
    })
  })

  it('gets currencies -- lru cached', (done) => {
    const currencies = new Currencies(redis)

    currencies.get_ccys('USD', (err, res) => {
      if (err) throw err
      assert.strictEqual(res.info, 'much usd, much wow')

      currencies.get_ccys('USD', (err, res) => {
        if (err) throw err

        assert.strictEqual(res.info, 'much usd, much wow')
        done()
      })
    })
  })

  it('returns null when currency not found', (done) => {
    const currencies = new Currencies(redis)

    currencies.get_ccys('KRAUTI', (err, res) => {
      if (err) throw err

      assert.strictEqual(res, null)
      done()
    })
  })
})
