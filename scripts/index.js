import fs from 'fs'
import path from 'path'

const plugins = {
    add: (origin) => {
        const content = origin.match(/\/\*([\s\S]*)\*\//)
        if (content) {
            console.info(`\x1b[35m${content[1].substring(0, 80)}\x1b[0m`)
            return content[1]
        } else {
            return ''
        }
    },
    remove: (origin) => {
        console.info(`\x1b[31m${origin.replace(/(\r\n|\r|\n)/g, '\\n').substring(0, 80)}\x1b[0m`)
        return ''
    }, replace: (origin, props) => {
        const by = (props.by || '').replace(/\^/g, '>').replace(/\\s/g, ' ')
        console.info(`\x1b[31m${origin.replace(/(\r\n|\r|\n)/g, '\\n').substring(0, 40)}\x1b[0m -> \x1b[35m${by.substring(0, 40)}\x1b[0m`)
        return by
    }
}


const files = fs.readdirSync(path.resolve(process.cwd(), 'src/evaluate'))

for (const name of files) {
  let code = fs.readFileSync(path.resolve(process.cwd(), 'src/evaluate', name), 'utf-8')

  code = code.replace(/function\*/g, 'function')
    .replace(/:\sIterableIterator<any>/g, ': any')
    .replace(/yield\*\s/g, '')

  code = code.replace(/\/\*<([^>]+?)>\*\/([\s\S]*?)\/\*<\/([^>]+?)>\*\//g,
    (origin, start, content, end) => {
      const params = start.split(' ')
      if (params[0] !== end) return origin
      const props = {}
      for (let i = 1; i < params.length; i++) {
        const kv = params[i].split(':=')
        props[kv[0]] = kv[1] || true
      }
      if (plugins[end]) {
        console.info(`\x1b[33m[${end.toUpperCase()}]\x1b[0m ${name}`)
        return plugins[end](content, props)
      } else {
        return origin
      }
    }
  )
  
  if (!fs.existsSync(path.resolve(process.cwd(), 'src/evaluate_n'))) {
    fs.mkdirSync(path.resolve(process.cwd(), 'src/evaluate_n'))
  }

  fs.writeFileSync(path.resolve(process.cwd(), 'src/evaluate_n', name), code, 'utf-8')
}