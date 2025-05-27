ReactNativeDictionaryLoader.prototype.loadArrayBuffer = async function (
  filename,
  callback
) {
  console.log(`[kuromoji] loadArrayBuffer called for: ${filename}`);
  let asset;
  try {
    asset = this.assets[filename];
    if (!asset) {
      throw new Error(`Asset not found for filename: ${filename}`);
    }
    console.log(`[kuromoji] Asset for ${filename}:`, asset);
  } catch (err) {
    console.error(`[kuromoji] Error retrieving asset for ${filename}:`, err);
    callback(err, null);
    return;
  }

  let uri;
  try {
    uri = asset.localUri;
    if (!uri) {
      throw new Error(`File not found: ${filename}`);
    }
    console.log(`[kuromoji] Reading file at URI: ${uri}`);
  } catch (err) {
    console.error(`[kuromoji] Error getting URI for ${filename}:`, err);
    callback(err, null);
    return;
  }

  let fileContents;
  try {
    fileContents = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log(`[kuromoji] Read file, base64 length: ${fileContents.length}`);
  } catch (err) {
    console.error(
      `[kuromoji] Error reading file for ${filename} at ${uri}:`,
      err
    );
    callback(err, null);
    return;
  }

  let buffer;
  try {
    buffer = Buffer.from(fileContents, "base64");
    console.log(`[kuromoji] Buffer created, length: ${buffer.length}`);
  } catch (err) {
    console.error(
      `[kuromoji] Error converting base64 to Buffer for ${filename}:`,
      err
    );
    callback(err, null);
    return;
  }

  let decompressed;
  try {
    decompressed = pako.inflate(buffer);
    console.log(`[kuromoji] Decompressed, length: ${decompressed.length}`);
  } catch (err) {
    console.error(
      `[kuromoji] Error decompressing buffer for ${filename}:`,
      err
    );
    callback(err, null);
    return;
  }

  try {
    const arrayBuffer = Uint8Array.from(decompressed).buffer;
    console.log(
      `[kuromoji] Returning arrayBuffer for ${filename}, byteLength: ${arrayBuffer.byteLength}`
    );
    callback(null, arrayBuffer);
  } catch (err) {
    console.error(
      `[kuromoji] Error creating ArrayBuffer for ${filename}:`,
      err
    );
    callback(err, null);
  }
};
