## demo 使用
### 直接使用
查看输出结果
```$xslt
$ node babel-plugin-meimport 
```

### webpack 使用
拷贝 babel-plugin-meimport 目录至 node_modules 中
```$xslt
// .babelrc
{
  "plugins": ["meimport"]
}
```
```$xslt
// webpack.config.js
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve("babel-loader")
      }
    ]
  }
};
```
```$xslt
$ npm run build
```


## 实现按需加载
https://astexplorer.net/ AST 解析
https://juejin.im/post/5a17d51851882531b15b2dfc 参考

## demo 
https://github.com/sfyr111/babel-plugin-import-demo

### 目的 import 语句转换
ImportSpecifier 和 ImportNamespaceSpecifier 转化成 ImportDefaultSpecifier

```
 //import { uniq } from "lodash"
 import uniq from "lodash/uniq"
```

### 实现思路
+ webpack 对 .js 文件使用 babel-loader
+ 使用 babel 插件对 js 文件进行转义
1 babel 通过 babylon 解释器把 js 转成 ast 
2 babel-traverse 对 AST 树进行解析遍历出整个树的path
3 使用 plugin 对 path 操作解析出新的 AST 树
+ 工具
babel-core提供transform方法将代码字符串转换为AST树
babel-types提供各种操作AST节点的工具库

### babel 插件实现
+ 语法转换用 babel，写 babel 插件
+ 插件的 vistior 对象
+ ImportDeclaration 方法 - 专门解析 import 操作符
+ path 参数 AST 树
+ 最后 path.replacereplaceWithMultiple 多节点替换单节点当前操作的语法片段
+ replaceWith 单节点替换单节点
```
// 配置 .babelrc { "plugins": ["meimport"] }
var types = require('babel-types');

const visitor = {
  /*
   * ImportDeclaration 只对 import 操作符转化
   * path @AST ast 语法树
   * opt  @object 配置参数
   * return @AST
   */
  ImportDeclaration(path, opt){
    const specifiers = path.node.specifiers;
    const source = path.node.source;
    // 判断是 import {} from '' 的语法
    if (!types.isImportDefaultSpecifier(specifiers[0]) && !types.isImportNamespaceSpecifier(specifiers[0])) {
      var declarations = specifiers.map((specifier) => {      // 遍历  uniq extend flatten cloneDeep
        return types.ImportDeclaration(                         // 创建importImportDeclaration节点
          [types.importDefaultSpecifier(specifier.local)], // 创建 import default 操作符
          types.StringLiteral(`${source.value}/${specifier.local.name}`) // lodasha/uniq 
        )
      })
      console.log(JSON.stringify(declarations, null, 2))
      path.replaceWithMultiple(declarations)

    }
  }
};

module.exports = function (babel) {
  return {
    visitor
  };
}
```
```
// 使用 babel.transform 转换
var babel = require('babel-core'); // transform 把代码转成 AST
const code = `import {uniq, extend, flatten, cloneDeep } from "lodash"`;

const result = babel.transform(code, {
  plugins: [
    // [ { visitor }, { opt1: 1, opt2: 2 }]
    { visitor }
  ]
})
```
