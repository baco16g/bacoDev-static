# bacoDev-static

静的サイトとかの生成に使用するboilerplateです。
reactとかvueとか使うほどでもない、って時に使います。

## Get started

```bash
$ git clone git@github.com:baco-16g/bacoDev-static.git

$ cd bacoDev-static
$ npm install
```

```bash
# run
$ npm run start # to develop
# Server running at: http://localhost:3000

```

jsonでコンテンツを管理したい場合は...

```json
// json/data.json

{
  "title": "ここにタイトル"
}
```
```html
// pug
- var title = data.data.title;
h1 #{title}
```
