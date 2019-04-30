var babel = require('babel-core');
var types = require('babel-types');

const code = `import {uniq, extend, flatten, cloneDeep } from "lodash"`;
// const code = `import { uniq } from "lodash"`;

const visitor = {
  // 对import转码
  ImportDeclaration(path, opt){
    // console.log(opt) // 插件的配置参数 .babelrc 里
    const specifiers = path.node.specifiers;
    const source = path.node.source;
    if (!types.isImportDefaultSpecifier(specifiers[0]) && !types.isImportNamespaceSpecifier(specifiers[0])) {
      var declarations = specifiers.map((specifier) => {      // 遍历  uniq extend flatten cloneDeep
        return types.ImportDeclaration(                         // 创建importImportDeclaration节点
          [types.importDefaultSpecifier(specifier.local)],
          types.StringLiteral(`${source.value}/${specifier.local.name}`)
        )
      })
      // console.log(JSON.stringify(declarations, null, 2))
      path.replaceWithMultiple(declarations)

    }
  }
};

const result = babel.transform(code, {
  plugins: [
    // [ { visitor }, { opt1: 1, opt2: 2 }]
    { visitor }
  ]
})

console.log(result.code)

/* output
  import uniq from "lodash/uniq";
  import extend from "lodash/extend";
  import flatten from "lodash/flatten";
  import cloneDeep from "lodash/cloneDeep";
 */