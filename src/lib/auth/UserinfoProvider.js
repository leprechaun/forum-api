class UserinfoProvider {
  constructor(config, options) {
    const axios_options = {
      baseURL: config.issuer
    }

    this.axios = options.axios.create(axios_options)

    this.endpoints = config.endpoints
    this.config = config

    this.cache = {
      expiry: new Date(0),
      token: false
    }
  }

  async getUserinfo(access_token, jwt) {
    if(!this.cache.token || new Date() > this.cache.expiry) {
      const extra = {}

      if(this.config.audience) {
        extra.audience = this.config.audience
      }

      const response = await this.axios.post( this.endpoints.token, {
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        grant_type: 'client_credentials',
        ...extra
      })

      this.cache = {
        expiry: new Date() + ( 1000 * response.data.expires_in ),
        token: response.data.access_token
      }

      return response.data.access_token
    } else {
      return this.cache.token
    }
  }
}

export default UserinfoProvider
