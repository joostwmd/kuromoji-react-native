"use strict";

const DictionaryLoader = require("./DictionaryLoader");
import * as FileSystem from "expo-file-system";
import pako from "pako";
import { Buffer } from "buffer";

function ReactNativeDictionaryLoader(options) {
  DictionaryLoader.call(this, null);
  this.assets = options.assets; // dictionary files are assets that must be passed in to the builder
  this.loadArrayBuffer = this.loadArrayBuffer.bind(this);
}

ReactNativeDictionaryLoader.prototype = Object.create(
  DictionaryLoader.prototype
);
ReactNativeDictionaryLoader.prototype.constructor = ReactNativeDictionaryLoader;

ReactNativeDictionaryLoader.prototype.loadArrayBuffer = async function (
  filename,
  callback
) {
  try {
    const asset = this.assets[filename];
    if (!asset) {
      throw new Error(`Asset not found for filename: ${filename}`);
    }

    const uri = asset.localUri;
    if (!uri) {
      throw new Error(`File not found: ${filename}`);
    }

    const fileContents = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert the base64 string to a Buffer
    const buffer = Buffer.from(fileContents, "base64");

    // Decompress using pako
    const decompressed = pako.inflate(buffer);
    const arrayBuffer = Uint8Array.from(decompressed).buffer;
    callback(null, arrayBuffer);
  } catch (error) {
    console.error(`Error in loadArrayBuffer for ${filename}:`, error);
    callback(error, null);
  }
};

module.exports = ReactNativeDictionaryLoader;
