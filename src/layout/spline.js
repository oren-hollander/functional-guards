'use strict'

const zerosMatrix = (r, c) => {
  const A = []
  for(let i = 0; i < r; i++) {
    A.push([])
    for(let j=0; j < c; j++)
      A[i].push(0)
  }
  return A
}

const swapRows = (m, k, l) => {
  const p = m[k]
  m[k] = m[l]
  m[l] = p
}

const solve = A => {
  var m = A.length

  for(let k = 0; k < m; k++) {
    var iMax = 0
    var iVal = Number.NEGATIVE_INFINITY

    for(let i = k; i < m; i++)
      if(A[i][k] > iVal) {
        iMax = i
        iVal = A[i][k]
      }

    swapRows(A, k, iMax)

    if(A[iMax][k] === 0)
      console.log("matrix is singular!")

    for(let i = k + 1; i < m; i++) {
      for(let j = k + 1; j < m + 1; j++)
        A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k])
      A[i][k] = 0
    }
  }

  const ks = []
  for(let i = m - 1; i >= 0; i--)
  {
    const v = A[i][m] / A[i][i]
    ks[i] = v
    for(let j = i-1; j >= 0; j--)
    {
      A[j][m] -= A[j][i] * v
      A[j][i] = 0
    }
  }
  return ks
}

const getNaturalKs = function(xs, ys)
{
  const n = xs.length - 1
  const A = zerosMatrix(n + 1, n + 2)

  for(let i = 1; i < n; i++)
  {
    A[i][i-1] = 1 / (xs[i] - xs[i - 1])
    A[i][i  ] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]))
    A[i][i+1] = 1 / (xs[i + 1] - xs[i])
    A[i][n+1] = 3 *
      ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) +
      (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])))
  }

  A[0][0  ] = 2 / (xs[1] - xs[0])
  A[0][1  ] = 1 / (xs[1] - xs[0])
  A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) * (xs[1] - xs[0]))

  A[n][n-1] = 1/(xs[n] - xs[n - 1])
  A[n][n  ] = 2/(xs[n] - xs[n - 1])
  A[n][n+1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]))

  return solve(A)
}

const evalSpline = function(x, xs, ys, ks)
{
  var i = 1
  while(xs[i] < x)
    i++

  const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1])

  const a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1])
  const b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1])

  return (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t)
}

