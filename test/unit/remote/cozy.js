/* eslint-env mocha */
/* @flow weak */

import should from 'should'

import RemoteCozy, { DirectoryNotFound } from '../../../src/remote/cozy'
import { FILES_DOCTYPE, ROOT_DIR_ID, TRASH_DIR_ID } from '../../../src/remote/constants'

import configHelpers from '../../helpers/config'
import { COZY_URL, builders, deleteAll } from '../../helpers/cozy'
import CozyStackDouble from '../../doubles/cozy_stack'

const cozyStackDouble = new CozyStackDouble()

describe('RemoteCozy', function () {
  before(() => cozyStackDouble.start())
  beforeEach(deleteAll)
  before('instanciate config', configHelpers.createConfig)
  before('register OAuth client', configHelpers.registerClient)
  after('clean config directory', configHelpers.cleanConfig)
  after(() => cozyStackDouble.stop())
  afterEach(() => cozyStackDouble.clearStub())

  let remoteCozy

  beforeEach(function () {
    this.config.cozyUrl = COZY_URL
    remoteCozy = new RemoteCozy(this.config)
  })

  describe('changes', function () {
    it('rejects when response status is not ok', function () {
      this.config.cozyUrl = cozyStackDouble.url()
      const remoteCozy = new RemoteCozy(this.config)

      cozyStackDouble.stub((req, res) => {
        res.writeHead(404, {'Content-Type': 'text/plain'})
        res.end('Not Found')
      })

      return remoteCozy.changes()
        .should.be.rejectedWith(/Could not fetch/)
    })

    it('rejects when cozy sends invalid JSON', function () {
      this.config.cozyUrl = cozyStackDouble.url()
      const remoteCozy = new RemoteCozy(this.config)

      cozyStackDouble.stub((req, res) => {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end('')
      })

      return remoteCozy.changes()
        .should.be.rejectedWith(SyntaxError)
    })

    context('when cozy works', function () {
      context('without an update sequence', function () {
        it('lists all changes since the database creation', async function () {
          let dir = await builders.remoteDir().create()
          let file = await builders.remoteFile().inDir(dir).create()

          let { ids } = await remoteCozy.changes()

          ids.should.containEql(dir._id)
          ids.should.containEql(file._id)
          ids.should.not.containEql(ROOT_DIR_ID)
          ids.should.not.containEql(TRASH_DIR_ID)
          ids.should.not.containEql(`_design/${FILES_DOCTYPE}`)
        })
      })

      context('with an update sequence', function () {
        it('lists only changes that occured since then', async function () {
          let { last_seq } = await remoteCozy.changes()

          let dir = await builders.remoteDir().create()
          let file = await builders.remoteFile().inDir(dir).create()

          let { ids } = await remoteCozy.changes(last_seq)

          ids.sort().should.eql([file._id, dir._id].sort())
        })
      })
    })
  })

  describe('find', function () {
    it('fetches a remote directory matching the given id', async function () {
      const remoteDir = await builders.remoteDir().create()

      const foundDir = await remoteCozy.find(remoteDir._id)

      foundDir.should.be.deepEqual(remoteDir)
    })

    it('fetches a remote root file including its path', async function () {
      const remoteFile = await builders.remoteFile().inRootDir().named('foo').create()

      const foundFile = await remoteCozy.find(remoteFile._id)

      foundFile.should.deepEqual({
        ...remoteFile,
        path: '/foo'
      })
    })

    it('fetches a remote non-root file including its path', async function () {
      const remoteDir = await builders.remoteDir().named('foo').inRootDir().create()
      const remoteFile = await builders.remoteFile().named('bar').inDir(remoteDir).create()

      const foundFile = await remoteCozy.find(remoteFile._id)

      foundFile.should.deepEqual({
        ...remoteFile,
        path: '/foo/bar'
      })
    })
  })

  describe('findMaybe', function () {
    it('does the same as find() when file or directory exists', async function () {
      const remoteDir = await builders.remoteDir().create()

      const foundDir = await remoteCozy.findMaybe(remoteDir._id)

      foundDir.should.deepEqual(remoteDir)
    })

    it('returns null when file or directory is not found', async function () {
      const found = await remoteCozy.findMaybe('missing')

      should.not.exist(found)
    })
  })

  describe('findDirectoryByPath', function () {
    it('resolves when the directory exists remotely', async function () {
      const dir = await builders.remoteDir().create()
      const subdir = await builders.remoteDir().inDir(dir).create()

      const foundDir = await remoteCozy.findDirectoryByPath(dir.path)
      foundDir.should.deepEqual(dir)

      const foundSubdir = await remoteCozy.findDirectoryByPath(subdir.path)
      foundSubdir.should.deepEqual(subdir)
    })

    it('rejects when the directory does not exist remotely', async function () {
      await builders.remoteFile().named('existing').inRootDir().create()

      for (let path of ['/missing', '/existing/missing']) {
        await remoteCozy.findDirectoryByPath(path)
          .should.be.rejectedWith(DirectoryNotFound)
      }
    })

    it('rejects when the path matches a file', async function () {
      await builders.remoteFile().named('foo').inRootDir().create()

      await remoteCozy.findDirectoryByPath('/foo')
        .should.be.rejectedWith(DirectoryNotFound)
    })
  })

  describe('downloadBinary', function () {
    it('resolves with a Readable stream of the file content', async function () {
      const remoteFile = await builders.remoteFile().data('foo').create()

      const stream = await remoteCozy.downloadBinary(remoteFile._id)

      let data = ''
      stream.on('data', chunk => { data += chunk })
      stream.on('end', () => { data.should.equal('foo') })
    })
  })
})
