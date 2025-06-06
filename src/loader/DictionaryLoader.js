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

var async = require("async");
var DynamicDictionaries = require("../dict/DynamicDictionaries");

/**
 * DictionaryLoader base constructor
 * @param {string} dic_path Dictionary path
 * @constructor
 */
function DictionaryLoader() {
  this.dic = new DynamicDictionaries();
}

DictionaryLoader.prototype.loadArrayBuffer = function (file, callback) {
  console.log("[kuromoji] DictionaryLoader.loadArrayBuffer called for:", file);
  throw new Error("DictionaryLoader#loadArrayBuffer should be overwrite");
};

/**
 * Load dictionary files
 * @param {DictionaryLoader~onLoad} load_callback Callback function called after loaded
 */
DictionaryLoader.prototype.load = function (load_callback) {
  var dic = this.dic;
  var loadArrayBuffer = this.loadArrayBuffer;

  async.parallel(
    [
      // Trie
      function (callback) {
        async.map(
          ["base.dat.gz", "check.dat.gz"],
          function (filename, _callback) {
            loadArrayBuffer(filename, function (err, buffer) {
              if (err) {
                return _callback(err);
              }
              console.log(
                "[kuromoji] Trie buffer loaded for",
                filename,
                "type:",
                typeof buffer,
                "length:",
                buffer.byteLength || buffer.length
              );
              _callback(null, buffer);
            });
          },
          function (err, buffers) {
            if (err) {
              return callback(err);
            }
            console.log(
              "[kuromoji] Trie buffers received:",
              buffers.map((b) => b && (b.byteLength || b.length))
            );
            var base_buffer = new Int32Array(buffers[0]);
            var check_buffer = new Int32Array(buffers[1]);

            dic.loadTrie(base_buffer, check_buffer);
            callback(null);
          }
        );
      },
      // Token info dictionaries
      function (callback) {
        async.map(
          ["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"],
          function (filename, _callback) {
            loadArrayBuffer(filename, function (err, buffer) {
              if (err) {
                console.log(`Error loading file: ${filename}`, err);
                return _callback(err);
              }
              console.log(
                "[kuromoji] Token info buffer loaded for",
                filename,
                "type:",
                typeof buffer,
                "length:",
                buffer.byteLength || buffer.length
              );
              _callback(null, buffer);
            });
          },
          function (err, buffers) {
            if (err) {
              console.log(
                "Error in async map for token info dictionaries:",
                err
              );
              return callback(err);
            }
            console.log(
              "[kuromoji] Token info buffers received:",
              buffers.map((b) => b && (b.byteLength || b.length))
            );
            var token_info_buffer = new Uint8Array(buffers[0]);
            var pos_buffer = new Uint8Array(buffers[1]);
            var target_map_buffer = new Uint8Array(buffers[2]);

            dic.loadTokenInfoDictionaries(
              token_info_buffer,
              pos_buffer,
              target_map_buffer
            );
            callback(null);
          }
        );
      },
      // Connection cost matrix
      function (callback) {
        loadArrayBuffer("cc.dat.gz", function (err, buffer) {
          if (err) {
            return callback(err);
          }
          console.log(
            "[kuromoji] Connection cost buffer loaded for cc.dat.gz, type:",
            typeof buffer,
            "length:",
            buffer.byteLength || buffer.length
          );
          var cc_buffer = new Int16Array(buffer);
          dic.loadConnectionCosts(cc_buffer);
          callback(null);
        });
      },
      // Unknown dictionaries
      function (callback) {
        async.map(
          [
            "unk.dat.gz",
            "unk_pos.dat.gz",
            "unk_map.dat.gz",
            "unk_char.dat.gz",
            "unk_compat.dat.gz",
            "unk_invoke.dat.gz",
          ],
          function (filename, _callback) {
            loadArrayBuffer(filename, function (err, buffer) {
              if (err) {
                return _callback(err);
              }
              console.log(
                "[kuromoji] Unknown dict buffer loaded for",
                filename,
                "type:",
                typeof buffer,
                "length:",
                buffer.byteLength || buffer.length
              );
              _callback(null, buffer);
            });
          },
          function (err, buffers) {
            if (err) {
              return callback(err);
            }
            console.log(
              "[kuromoji] Unknown dict buffers received:",
              buffers.map((b) => b && (b.byteLength || b.length))
            );
            var unk_buffer = new Uint8Array(buffers[0]);
            var unk_pos_buffer = new Uint8Array(buffers[1]);
            var unk_map_buffer = new Uint8Array(buffers[2]);
            var cat_map_buffer = new Uint8Array(buffers[3]);
            var compat_cat_map_buffer = new Uint32Array(buffers[4]);
            var invoke_def_buffer = new Uint8Array(buffers[5]);

            dic.loadUnknownDictionaries(
              unk_buffer,
              unk_pos_buffer,
              unk_map_buffer,
              cat_map_buffer,
              compat_cat_map_buffer,
              invoke_def_buffer
            );
            // dic.loadUnknownDictionaries(char_buffer, unk_buffer);
            callback(null);
          }
        );
      },
    ],
    function (err) {
      load_callback(err, dic);
    }
  );
};

/**
 * Callback
 * @callback DictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {DynamicDictionaries} dic Loaded dictionary
 */

module.exports = DictionaryLoader;
