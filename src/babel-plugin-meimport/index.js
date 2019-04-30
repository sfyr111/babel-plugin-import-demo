// todo 拷贝到 node_modules 中使用, .babelrc 配置 { "plugins": ["meimport"] }
var t = require('babel-types');
const visitor = {
  // 只处理 AST 语法的 import 操作符
  ImportDeclaration(path, _ref = {opts:{}}){
    const specifiers = path.node.specifiers;
    const source = path.node.source;
    if (!t.isImportDefaultSpecifier(specifiers[0]) ) {
      var declarations = specifiers.map((specifier) => { // 遍历  import { uniq extend flatten cloneDeep } from 'lodash' 中的 uniq extend flatten cloneDeep, import 的操作符
        // 解析成 import uniq from 'lodash/uniq' 这种 import 格式的 AST 结构的 importImportDeclaration 节点
        return t.ImportDeclaration(
          [t.importDefaultSpecifier(specifier.local)],
          t.StringLiteral(`${source.value}/${specifier.local.name}`)
        )
      })
      path.replaceWithMultiple(declarations) // replaceWithMultiple 替换多个
    }
  }

};
module.exports = function (babel) {
  return {
    visitor
  };
}