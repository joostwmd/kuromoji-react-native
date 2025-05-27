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

var TokenInfoDictionary = require("./TokenInfoDictionary");
var CharacterDefinition = require("./CharacterDefinition");
var ByteBuffer = require("../util/ByteBuffer");

function createMapProxy(map) {
  return new Proxy(map, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return target.get(prop);
    },
    set(target, prop, value) {
      target.set(prop, value);
      return true;
    },
    has(target, prop) {
      return target.has(prop);
    },
    deleteProperty(target, prop) {
      return target.delete(prop);
    },
  });
}

/**
 * UnknownDictionary
 * @constructor
 */
function UnknownDictionary() {
  this.dictionary = new ByteBuffer(10 * 1024 * 1024);
  console.log(
    "[kuromoji] UnknownDictionary: dictionary initialized, type:",
    typeof this.dictionary,
    "size:",
    this.dictionary.buffer.length
  );
  this.temp_map = new Map();
  console.log(
    "[kuromoji] UnknownDictionary: temp_map initialized, type:",
    typeof this.temp_map,
    "size:",
    this.temp_map.size
  );
  this.target_map = createMapProxy(this.temp_map);
  this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
  console.log(
    "[kuromoji] UnknownDictionary: pos_buffer initialized, type:",
    typeof this.pos_buffer,
    "size:",
    this.pos_buffer.buffer.length
  );
  this.character_definition = null;
}

// Inherit from TokenInfoDictionary as a super class
UnknownDictionary.prototype = Object.create(TokenInfoDictionary.prototype);

UnknownDictionary.prototype.characterDefinition = function (
  character_definition
) {
  this.character_definition = character_definition;
  return this;
};

UnknownDictionary.prototype.lookup = function (ch) {
  return this.character_definition.lookup(ch);
};

UnknownDictionary.prototype.lookupCompatibleCategory = function (ch) {
  return this.character_definition.lookupCompatibleCategory(ch);
};

UnknownDictionary.prototype.loadUnknownDictionaries = function (
  unk_buffer,
  unk_pos_buffer,
  unk_map_buffer,
  cat_map_buffer,
  compat_cat_map_buffer,
  invoke_def_buffer
) {
  console.log("[kuromoji] loadUnknownDictionaries called");
  console.log(
    "  unk_buffer type:",
    typeof unk_buffer,
    "length:",
    unk_buffer.byteLength || unk_buffer.length
  );
  console.log(
    "  unk_pos_buffer type:",
    typeof unk_pos_buffer,
    "length:",
    unk_pos_buffer.byteLength || unk_pos_buffer.length
  );
  console.log(
    "  unk_map_buffer type:",
    typeof unk_map_buffer,
    "length:",
    unk_map_buffer.byteLength || unk_map_buffer.length
  );
  console.log(
    "  cat_map_buffer type:",
    typeof cat_map_buffer,
    "length:",
    cat_map_buffer.byteLength || cat_map_buffer.length
  );
  console.log(
    "  compat_cat_map_buffer type:",
    typeof compat_cat_map_buffer,
    "length:",
    compat_cat_map_buffer.byteLength || compat_cat_map_buffer.length
  );
  console.log(
    "  invoke_def_buffer type:",
    typeof invoke_def_buffer,
    "length:",
    invoke_def_buffer.byteLength || invoke_def_buffer.length
  );
  this.loadDictionary(unk_buffer);
  this.loadPosVector(unk_pos_buffer);
  this.loadTargetMap(unk_map_buffer);
  this.character_definition = CharacterDefinition.load(
    cat_map_buffer,
    compat_cat_map_buffer,
    invoke_def_buffer
  );
  console.log(
    "[kuromoji] UnknownDictionary: character_definition loaded:",
    !!this.character_definition
  );
};

module.exports = UnknownDictionary;
