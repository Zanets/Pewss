import bcrypt from 'bcrypt'

class Encrypt {
  enc (pwd) {
    return bcrypt.hashSync(pwd, 10)
  }

  async compare (pwd, hash) {
    const res = await bcrypt.compare(pwd, hash)
    return res
  }
}

module.exports = new Encrypt()
