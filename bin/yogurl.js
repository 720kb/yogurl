#!/usr/bin/env node
/*globals module process Buffer console require*/

'use strict';

var isCLI
  , loading;

const cli = require('commander')
  , fs = require('fs')
  , path = require('path')
  , request = require('request')
  , ora = require('ora')
  , config = require('./../config/config.json')
  , packageJSON = require('./../package.json')
  , defaultLoadingMessage = 'Yogurl is running ...'
  , progress = message => {
    if (isCLI) {
      loading = ora(message || defaultLoadingMessage);
      loading.color = 'green';
      loading.start();
    }
  }
  , progressStop = (message, result, data) => {

    if (message && isCLI) {
      loading.stop();
      loading.clear();
      loading = ora(message);
    }

    if (result === 'success') {
      if (isCLI) {
        loading.succeed();
        loading.stop();
        loading.clear();
        console.info('');
        process.stdout.write(data);
        console.info('');
      }

      process.exit();
    }

    if (result === 'fail') {
      if (isCLI) {
        loading.fail();
        loading.stop();
        loading.clear();
      } else {
        console.info('');
        process.stderr.write(data || message);
        console.info('');
      }

      process.exit(1);
    }
  }
  , helpBanner = () => {
    console.log('');
    console.log('### Quick example with a source file:');
    console.log('');
    console.log('----------------------------------------------');
    console.log('$ yogurl /path/to/file.js');
    console.log('----------------------------------------------');
    console.log('');
    console.log('');
    console.log('### Quick example with a code string:');
    console.log('');
    console.log('-----------------------------------------------');
    console.log('$ yogurl ".yogurl {display:yogurl;}" css');
    console.log('-----------------------------------------------');
    console.log('');
    console.log('For more usage infos see: http://github.com/720kb/yogurl/readme.md');
    console.log('');
    console.log('Yogurl is also online at: http://yogurl.io');
    console.log('');
    console.log('MIT License, © 720kb <http://720kb.net>');
    console.log('', '', '');
    process.exit();
  }
  , upload = (source, ext) => {

    return new Promise((resolve, reject) => {

      let extTrimmed;

      if (!source) {

        reject('Buddy! You forgot the source to yogurl!');
      }

      if (ext) {
        extTrimmed = ext.replace('.', '');
      }

      setTimeout(() => {
        request({
          'url': config.wsUrl,
          'method': 'PUT',
          'json': {
            'code': source.toString(),
            'ext': extTrimmed
          }
        }, (error, response) => {

          if (!response || error) {
            reject('Oh not now! Yogurl server is having bad times, let\'s retry later.');
          }

          if (!error
            && response.statusCode === 200) {
            resolve({
              'message': 'Dang! Remember that this URL will not last forever.',
              'data': `${config.linkUri}${response.body}`
            });
          } else {
            reject('Ufff! Yogurl server is having bad times, let\'s retry later.');
          }
        });
      }, config.timebetweenWsCalls);
    });
  }
  , getFileContent = source => {

    return fs.readFileSync(source).toString();
  }
  , getFileExt = source => {

    return path.extname(source);
  }
  , isFile = source => {
    try {

      if (fs.readFileSync(source).toString()) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  , isAcceptedExt = ext => {

    if (config.acceptedFileExts.indexOf(ext) !== -1) {
      return true;
    }
  }
  , init = (source, ext) => {
    return new Promise((resolve, reject) => {

      let sourceType
        , finalSource
        , finalSourceExt;

      //Is file or code?
      if (isFile(source)) {
        sourceType = 'file';
      } else {
        sourceType = 'code';
      }

      //it's a file source
      if (sourceType === 'file') {
        if ((
          !ext ||
          ext &&
          !isAcceptedExt(ext)
          ) &&
          !isAcceptedExt(getFileExt(source).toString().replace('.', ''))) {

          reject('Ouch! This file type is weird, please specify a file extension to output it to. (css, js, json etc..)');
        }

        finalSource = getFileContent(source);

        if (ext) {
          finalSourceExt = ext.toString().replace('.', '');
        } else {
          finalSourceExt = getFileExt(source).toString().replace('.', '');
        }
      }
      //its a code string
      if (sourceType === 'code') {

        finalSource = source;

        if (ext) {
          finalSourceExt = ext.toString().replace('.', '');
        }

        if (!finalSourceExt) {
          reject('Bam! You forgot the file extension you desire.');
        }
      }

      if (Buffer.byteLength(finalSource) > config.fileKbSizeLimit) {
        reject('Hoy! Source code is too large, keep it under 150kb.');
      }

      if (!isAcceptedExt(finalSourceExt)) {
        reject(`Hey! The .${finalSourceExt} extension is not supported.`);
      }

      if (!finalSource.length ||
          finalSource.length &&
          finalSource.length < 10) {

        reject('Jouch! Your code is really too short ...');
      }
      //GO upload
      resolve({
        'source': finalSource,
        'ext': finalSourceExt,
        'message': 'Looks everythings ok, let\'s yogurl it!'
      });
    });
  }
  , exportUpload = (inputSource, inputExt) => {
    return new Promise((resolve, reject) => {
      init(inputSource, inputExt).then(data => {
        return upload(data.source, data.ext);
      }).then(result => {
        resolve(result);
      }).catch(err => {
        reject(err);
      });
    });
  };

cli
  .version(packageJSON.version)
  .usage('<source> [ext]')
  .action((source, ext) => {

    isCLI = true;
    progress();
    //empty ext is given as [Object] need to fix this dirtyfix:
    if (ext &&
      (typeof ext !== 'string')) {
      ext = undefined;
    }

    init(source, ext).then(data => {

      upload(data.source, data.ext).then(result => {
        progressStop(result.message, 'success', result.data);
      }).catch(err => {
        progressStop(err, 'fail');
      });
    }).catch(err => {
      progressStop(err, 'fail');
    });
  })
  .option('-v, --version', 'output the version number')
  .on('-v', () => {
    process.stdout.write(packageJSON.version);
  })
  .on('-h', () => {
    helpBanner();
  })
  .on('--help', () => {
    helpBanner();
  });

cli.parse(process.argv);

module.exports = {
  'upload': exportUpload
};
