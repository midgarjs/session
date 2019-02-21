const session = require('express-session')
const moment = require('moment-timezone')
const utils = require('@midgar/utils')

const Plugin = require('@midgar/midgar/plugin')

/**
 * MidgarSession plugin
 * 
 * Manage sessions
 */
class MidgarSession extends Plugin {

  async init() {
    //set session config
    this._config = utils.assignRecursive({
      store: 'sequelize',
      resave: false,
      rolling: false,
      cookie: {},
      saveUninitialized: true,
      proxy: true,
      secureCookie: true,
    }, this.midgar.config.session || {})

    //store session stores
    this._stores = {}

    //bind initHttpServer event
    this.pm.on('initHttpServer', () => {
      return this._initHttpServer()
    })

  }
  /**
   * add a session storage callback
   * @param {string} name storage name
   */
  async addStore(name, callback) {
    this._stores[name] = callback
  }

  /**
   * return a session storage callback
   * @param {string} name storage name
   */
  async getStore(name) {
    if (this._stores[name] !== undefined) {
      return this._stores[name]
    }

    throw new Error ('Invalid session store name: ' + name)
  }


  /**
   * Init session
   */
  async _initHttpServer() {
    const expireDate = moment()
    expireDate.tz('Europe/Paris')
    expireDate.add(5, 'days')
    //console.log(expireDate.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (UTC)"));
    

    if (!this._config.secretKey)
      throw new Error('No session secret key set')

    const sessionConfig = {
      secret: this._config.secretKey,
      resave: this._config.resave,
      rolling: this._config.rolling,
      saveUninitialized: this._config.saveUninitialized,
      cookie: this._config.cookie,
      proxy: this._config.proxy,
    }

    const store = await this._getStore()
    if (store) {
      sessionConfig.store = store
    }

    sessionConfig.cookie.expires = expireDate.toDate() //new Date(Date.now() + 12)
    
    if (this._config.secureCookie) {
      this.midgar.app.set('trust proxy', 1) // trust first proxy
      sessionConfig.cookie.secure = true // serve secure cookies
    }

    //add the middelware
    this.midgar.app.use(session(sessionConfig))

    try {
      await this.pm.emit('@midgar/session:afterInit')
    } catch (error) {
      this.midgar.error(error)
    }
  }

  /**
   * Return the session storage
   */
  async _getStore() {
    const storeCallback = await this.getStore(this._config.store)

    return storeCallback(this.midgar)
  }
}

module.exports = MidgarSession
