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

var doublearray = require("doublearray");
var TokenInfoDictionary = require("./TokenInfoDictionary");
var ConnectionCosts = require("./ConnectionCosts");
var UnknownDictionary = require("./UnknownDictionary");

/**
 * Dictionaries container for Tokenizer
 * @param {DoubleArray} trie
 * @param {TokenInfoDictionary} token_info_dictionary
 * @param {ConnectionCosts} connection_costs
 * @param {UnknownDictionary} unknown_dictionary
 * @constructor
 */
function DynamicDictionaries(
  trie,
  token_info_dictionary,
  connection_costs,
  unknown_dictionary
) {
  if (trie != null) {
    this.trie = trie;
  } else {
    this.trie = doublearray.builder(0).build([{ k: "", v: 1 }]);
  }
  if (token_info_dictionary != null) {
    this.token_info_dictionary = token_info_dictionary;
  } else {
    this.token_info_dictionary = new TokenInfoDictionary();
  }
  if (connection_costs != null) {
    this.connection_costs = connection_costs;
  } else {
    // backward_size * backward_size
    this.connection_costs = new ConnectionCosts(0, 0);
  }
  if (unknown_dictionary != null) {
    this.unknown_dictionary = unknown_dictionary;
  } else {
    this.unknown_dictionary = new UnknownDictionary();
  }
  console.log("[kuromoji] DynamicDictionaries initialized:", {
    trie: typeof this.trie,
    token_info_dictionary: typeof this.token_info_dictionary,
    connection_costs: typeof this.connection_costs,
    unknown_dictionary: typeof this.unknown_dictionary,
  });
}

// from base.dat & check.dat
DynamicDictionaries.prototype.loadTrie = function (base_buffer, check_buffer) {
  console.log(
    "[kuromoji] loadTrie called, base_buffer type:",
    typeof base_buffer,
    "length:",
    base_buffer.byteLength || base_buffer.length,
    "check_buffer type:",
    typeof check_buffer,
    "length:",
    check_buffer.byteLength || check_buffer.length
  );
  this.trie = doublearray.load(base_buffer, check_buffer);
  return this;
};

DynamicDictionaries.prototype.loadTokenInfoDictionaries = function (
  token_info_buffer,
  pos_buffer,
  target_map_buffer
) {
  console.log("[kuromoji] loadTokenInfoDictionaries called");
  console.log(
    "  token_info_buffer type:",
    typeof token_info_buffer,
    "length:",
    token_info_buffer.byteLength || token_info_buffer.length
  );
  console.log(
    "  pos_buffer type:",
    typeof pos_buffer,
    "length:",
    pos_buffer.byteLength || pos_buffer.length
  );
  console.log(
    "  target_map_buffer type:",
    typeof target_map_buffer,
    "length:",
    target_map_buffer.byteLength || target_map_buffer.length
  );
  this.token_info_dictionary.loadDictionary(token_info_buffer);
  this.token_info_dictionary.loadPosVector(pos_buffer);
  this.token_info_dictionary.loadTargetMap(target_map_buffer);
  return this;
};

DynamicDictionaries.prototype.loadConnectionCosts = function (cc_buffer) {
  console.log(
    "[kuromoji] loadConnectionCosts called, cc_buffer type:",
    typeof cc_buffer,
    "length:",
    cc_buffer.byteLength || cc_buffer.length
  );
  this.connection_costs.loadConnectionCosts(cc_buffer);
  return this;
};

DynamicDictionaries.prototype.loadUnknownDictionaries = function (
  unk_buffer,
  unk_pos_buffer,
  unk_map_buffer,
  cat_map_buffer,
  compat_cat_map_buffer,
  invoke_def_buffer
) {
  console.log("[kuromoji] loadUnknownDictionaries called");
  this.unknown_dictionary.loadUnknownDictionaries(
    unk_buffer,
    unk_pos_buffer,
    unk_map_buffer,
    cat_map_buffer,
    compat_cat_map_buffer,
    invoke_def_buffer
  );
  return this;
};

module.exports = DynamicDictionaries;
