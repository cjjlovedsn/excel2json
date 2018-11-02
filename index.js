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

function excel2json (filepath, callback, options) {
  fileRead(filepath, (sheets, filename, workbook) => {
    sheets.forEach(sheet => {
      const sheetJson = xlsx.utils.sheet_to_json(sheet, options)
      callback && callback(sheetJson, filename, sheet, workbook)
    })
  })
}

excel2json(path.join(__dirname, 'source'), (data, filename) => {
  if (data[0].label === 'Administrator') return
  fs.writeFile(path.join(__dirname, 'output', filename.replace(/\.xlsx$/, '.1.json')), JSON.stringify(data.map(({ level, ...item }) => item)), () => {
    console.log('转换完成')
  })
  const result = [
    {
      label: '全部',
      code: ''
    }
  ]
  let temp = []
  for (let i = 0, len = data.length; i < len; i++) {
    let { level, ...item} = data[i]
    if (!level) continue
    // 判断是否存在子级，有则添加一个空的children数组用来存放子级
    let next = data[i + 1]
    if (next) {
      if (level < next.level) {
        item.children = []
      }
    }
    temp[level] = item.children
    if (level === 1) {
      result.push(item)
      continue
    }
    target = temp[level - 1]
    target && target.push(item)
  }
  fs.writeFile(path.join(__dirname, 'output', filename.replace(/\.xlsx$/, '.json')), JSON.stringify(result), () => {
    console.log('转换完成')
  })
}, { header: ['label', 'label', 'label', 'label', 'code', 'level'] })