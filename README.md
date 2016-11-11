# static-boilerplate

静的サイトの生成に使用するboilerplate.

## Get started

```bash
$ git clone git@github.com:baco16g/static-boilerplate.git

$ cd static-boilerplate
$ npm install
```

### Tasks

- `npm run dev`
- `npm run prod`

### Other

- jsonで, テキストやパスを一括管理しています.

```json
// json/data.json

{
  "title": "ここにタイトル"
}
```
```html
// .pug

- var title = data.data.title;
h1 #{title}
```
