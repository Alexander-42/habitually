import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
} from '../auth.js'

// Mirrors the module-level default in auth.js when JWT_SECRET is unset.
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

describe('password hashing', () => {
  it('hashes a password to something other than the plaintext', () => {
    const hash = hashPassword('secret123')
    assert.notEqual(hash, 'secret123')
    assert.ok(hash.length > 0)
  })

  it('verifies a correct password', () => {
    const hash = hashPassword('secret123')
    assert.equal(verifyPassword('secret123', hash), true)
  })

  it('rejects an incorrect password', () => {
    const hash = hashPassword('secret123')
    assert.equal(verifyPassword('wrong', hash), false)
  })
})

describe('signToken', () => {
  it('produces a JWT carrying the user id (sub) and username', () => {
    const token = signToken({ id: 'u1', username: 'alice' })
    const decoded = jwt.verify(token, SECRET)
    assert.equal(decoded.sub, 'u1')
    assert.equal(decoded.username, 'alice')
  })

  it('sets an expiry', () => {
    const token = signToken({ id: 'u1', username: 'alice' })
    const decoded = jwt.verify(token, SECRET)
    assert.ok(decoded.exp > decoded.iat)
  })
})

describe('requireAuth middleware', () => {
  function mockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(payload) {
        this.body = payload
        return this
      },
    }
  }

  it('returns 401 when the Authorization header is missing', () => {
    const res = mockRes()
    let nextCalled = false
    requireAuth({ headers: {} }, res, () => {
      nextCalled = true
    })
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalled, false)
  })

  it('returns 401 for a malformed / invalid token', () => {
    const res = mockRes()
    let nextCalled = false
    requireAuth({ headers: { authorization: 'Bearer not-a-jwt' } }, res, () => {
      nextCalled = true
    })
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalled, false)
  })

  it('calls next and attaches userId/username for a valid token', () => {
    const token = signToken({ id: 'u42', username: 'bob' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    let nextCalled = false
    requireAuth(req, res, () => {
      nextCalled = true
    })
    assert.equal(nextCalled, true)
    assert.equal(res.statusCode, null) // no error response
    assert.equal(req.userId, 'u42')
    assert.equal(req.username, 'bob')
  })
})
