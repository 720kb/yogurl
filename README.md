<p align="center">
  <a href="http://yogurl.io">
    <img width="250" src="http://i.imgur.com/i2aenJ7.png">
  </a>
  <p align="center">Easy urls for your files and code.</p>
</p>

###What's Yogurl?

Yogurl is the simple command line tool for [Yogurl.io](https://yogurl.io)

It can be used as a [CLI](#install-cli) or installed as [node dependencies](#node-usage) if you prefer.

###Requirements

Node.js v5+

###Install CLI

```html
npm install -g yogurl
```

###CLI Usage

```
$ yogurl <source> [ext]
```

```source```: A valid [file](Accepted extensions and file types) path or code string

```ext```: A valid [extension](Accepted extensions and file types) available

####Yogurlify a file

```bash
$ yogurl path/to/file.js
```

####Yogurlify a code string

```bash
$ yogurl ".yogurl{ display:yogurl; }" css
```

###Node Usage

####Installation

```bash
$ npm install yogurl --save
```

####Yogurlify a file

```javascript
const Yogurl = require('yogurl');

Yogurl.upload('/path/to/file.json', 'json').then((data) => {
  //file is ready
  console.log(data);
  console.log('File is ready at:', data.data);

}).catch((err) => {
  //error
  console.log(err);
});
```

####Yogurlify a code string

```javascript
const Yogurl = require('yogurl');

Yogurl.upload("var x = 'yogurlify a javascript var';", 'js').then((data) => {
  //file is ready
  console.log(data);
  console.log(`File is ready at: ${data.data}`);

}).catch((err) => {
  //error
  console.log(err);
});
```

###Available Output File Extensions
`.js`

`.css`

`.scss`

`.map`

`.json`

###Available Input File Extensions

ANY (supposed)

###Why Yogurl?

Yogurl is born to help devs to get an url of their local ources (files or code) easily and as quick as possible.
It is built for **development purposes**, it's not really recommended to use it in a production environment, **yogurl urls gets deleted after some time, so that you don't have to take care about them**.

Since Yogurl is not backed by any sponsor or funds of any kind: we apologize for any trouble/problem/issue you could encounter.

Please don't spam it and use it with moderation, Yogurl is your friend.

###Contact Yogurl

Feel free to open an issue or contact us on [twitter](http://twitter.com/720kb_)

###Contributing

We will be much grateful if you help us to grow and improve the project.
Contribute by forking, opening issues, pull requests and whatever.

###License

[MIT](http://github.com/720kb/yogurl/#license.md)
