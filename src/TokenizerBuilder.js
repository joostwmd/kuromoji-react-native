/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var Tokenizer = require("./Tokenizer");
var ReactNativeDictionaryLoader = require("./loader/ReactNativeDictionaryLoader");

/**
 * TokenizerBuilder create Tokenizer instance.
 * @param {Object} option JSON object which have key-value pairs settings
 * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
 * @constructor
 */
function TokenizerBuilder(option) {
  if (!option.assets) {
    throw new Error("Dictionary assets must be provided");
  }
  this.assets = option.assets;
}

TokenizerBuilder.prototype.downloadAssets = async function () {
  const assetDownloadPromises = Object.values(this.assets).map((asset) => {
    return asset.downloadAsync();
  });
  await Promise.all(assetDownloadPromises);
};

/**
 * Build Tokenizer instance by asynchronous manner
 * @param {TokenizerBuilder~onLoad} callback Callback function
 */
TokenizerBuilder.prototype.build = async function (callback) {
  await this.downloadAssets();
  var loader = new ReactNativeDictionaryLoader({ assets: this.assets });
  await loader.load(function (err, dic) {
    callback(err, new Tokenizer(dic));
  });
};

/**
 * Callback used by build
 * @callback TokenizerBuilder~onLoad
 * @param {Object} err Error object
 * @param {Tokenizer} tokenizer Prepared Tokenizer
 */

module.exports = TokenizerBuilder;
