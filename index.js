const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const fileRead = (filePath, callback) => {
  fs.readdir(filePath, (err, files) => {
    if (err) throw err
    files.forEach(filename => {
      let fileDir = path.join(filePath, filename)
      fs.stat(fileDir, (err, stats) => {
        if (err) throw err
        const isFile = stats.isFile()
        if (isFile) {
          let workbook = xlsx.readFile(fileDir)
          let sheets = workbook.SheetNames.map(name => {
            return workbook.Sheets[name] // 读取表
          })
          callback && callback(sheets, filename, workbook)
        }
      })
    })
  })
}

fileRead(path.join(__dirname, 'source'), (sheets, filename) => {
  let RATE = '覆盖占比'
  let RESULT_CATEGORY = '结果类别'
  let positions = sheets.map(sheet => {
    let sheetJson = xlsx.utils.sheet_to_json(sheet)
    let result = {}
    sheetJson.forEach(({ lon, lat, [RATE]: rate, [RESULT_CATEGORY]: category }) => {
      if (category) {
        let arr = result[category] = result[category] || []
        arr.push([lon, lat, rate])
      }
    })
    return result
  })
  fs.writeFile(path.join(__dirname, 'output', filename.replace(/\.xlsx$/, '.json')), JSON.stringify(positions[0]), () => {
    console.log('转换完成')
  })
})
