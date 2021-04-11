const N = 4 // 节点总数
const D = 0.85 // 修正系数
const T = (1 - D) / N
let a = b = c = d = 0.25 // 每个节点的pagerank值

function loop(i) {
  const _a = (b/2) * D + T
  const _b = (a/3 + d) * D + T
  const _c = (a/3) * D + T
  const _d = (a/3 + b/2 + c) * D + T
  // _a = (b/2)
  // _b = (a/3 + d)
  // _c = (a/3)
  // _d = (a/3 + b/2 + c)
  console.log(`STEP ${i}\nPRA: ${_a}\nPRB: ${_b}\nPRC: ${_c}\nPRD: ${_d}\n..........`)
  return [_a, _b, _c, _d]
}

const TIMES = 205
for (let i=1; i<=TIMES; i++) [a, b, c, d] = loop(i)
console.log(a + b + c + d)
