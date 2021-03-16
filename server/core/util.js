const jwt = require('jsonwebtoken')
/***
 *
 */
const findMembers = function(instance, { prefix, specifiedType, filter }) {
  // 递归函数
  function _find(instance) {
    //基线条件（跳出递归）
    if (instance.__proto__ === null) return []

    let names = Reflect.ownKeys(instance)
    names = names.filter(name => {
      // 过滤掉不满足条件的属性或方法名
      return _shouldKeep(name)
    })

    return [...names, ..._find(instance.__proto__)]
  }

  function _shouldKeep(value) {
    if (filter) {
      if (filter(value)) {
        return true
      }
    }
    if (prefix) if (value.startsWith(prefix)) return true
    if (specifiedType) if (instance[value] instanceof specifiedType) return true
  }

  return _find(instance)
}

const generateToken = function(uid,scope){
  // 颁发令牌
  const secretKey = global.config.security.secretKey
  const expiresIn = global.config.security.expiresIn
  //  生成令牌的方法需要接收三个参数 第一个是传入的自定义信息 第二个参数是私有秘钥 第三个参数是可选配置项
  const token = jwt.sign(
   {uid,scope},secretKey,{expiresIn}
  )
  return token
}

// // 颁发令牌
// const generateToken = function(uid, scope) {
//   const secretKey = global.config.security.secretKey
//   const expiresIn = global.config.security.expiresIn
//   const token = jwt.sign(
//     {
//       uid,
//       scope
//     },
//     secretKey,
//     {
//       expiresIn
//     }
//   )

//   return token
// }

// 数组去重
const distinct = (arr1, arr2) => {
  const result = []
  const obj = {}
  arr1.concat(arr2).map(i => {
    if (!obj[i.id]) {
      result.push(i)
      obj[i.id] = 1
    }
  })
  return {nodes: result, obj}
}

module.exports = {
  findMembers,
  generateToken,
  distinct,
}
