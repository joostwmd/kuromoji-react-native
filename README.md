# kuromoji.js

This is a React Native port, based on [takuyaa](https://github.com/takuyaa/kuromoji.js)
JavaScript implementation of Japanese morphological analyzer, which is a pure JavaScript porting of [Kuromoji](https://www.atilika.com/ja/kuromoji/).

## Usage

### Node.js

Install with npm package manager:

    npm install @charlescoeder/react-native-kuromoji

To use this library in a React Native project, copy the `dict` folder into your assets folder, and then:

```ts
import kuromoji from "@/charlescoeder/kuromoji";

// load assets: copy 'dict' folder to your assets folder
const assets = {
  "base.dat.gz": Asset.fromModule(require("../assets/dict/base.dat.gz")),
  "cc.dat.gz": Asset.fromModule(require("../assets/dict/cc.dat.gz")),
  "check.dat.gz": Asset.fromModule(require("../assets/dict/check.dat.gz")),
  "tid.dat.gz": Asset.fromModule(require("../assets/dict/tid.dat.gz")),
  "tid_map.dat.gz": Asset.fromModule(require("../assets/dict/tid_map.dat.gz")),
  "tid_pos.dat.gz": Asset.fromModule(require("../assets/dict/tid_pos.dat.gz")),
  "unk.dat.gz": Asset.fromModule(require("../assets/dict/unk.dat.gz")),
  "unk_char.dat.gz": Asset.fromModule(
    require("../assets/dict/unk_char.dat.gz")
  ),
  "unk_compat.dat.gz": Asset.fromModule(
    require("../assets/dict/unk_compat.dat.gz")
  ),
  "unk_invoke.dat.gz": Asset.fromModule(
    require("../assets/dict/unk_invoke.dat.gz")
  ),
  "unk_map.dat.gz": Asset.fromModule(require("../assets/dict/unk_map.dat.gz")),
  "unk_pos.dat.gz": Asset.fromModule(require("../assets/dict/unk_pos.dat.gz")),
};
kuromoji
  .builder({ assets })
  .build(
    (err: any, tokenizer: { tokenize: (arg0: string) => KUROMOJI_TOKEN[] }) => {
      if (err) {
        console.error("kuromoji error:", err);
        reject(err);
      } else {
        console.log("tokenizer loaded");
        // parse sentences or save tokenizer as a singleton
        const kuromoji_tokens = tokenizer.tokenize(mySentence);
      }
    }
  );
```

`KUROMOJI_TOKEN` is defined like this

```ts
export interface KUROMOJI_TOKEN {
  word_id: number;
  word_type: "KNOWN" | "UNKNOWN" | "BOS" | "EOS";
  word_position: number;
  surface_form: string | Uint8Array;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading?: string;
  pronunciation?: string;
}
```

copy this type into your project if you are using TypeScript.

Here is an example of `KUROMOJI_TOKEN` to explain what each component means

```
    [ {
        word_id: 509800,          // 辞書内での単語ID
        word_type: 'KNOWN',       // 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN)
        word_position: 1,         // 単語の開始位置
        surface_form: '黒文字',    // 表層形
        pos: '名詞',               // 品詞
        pos_detail_1: '一般',      // 品詞細分類1
        pos_detail_2: '*',        // 品詞細分類2
        pos_detail_3: '*',        // 品詞細分類3
        conjugated_type: '*',     // 活用型
        conjugated_form: '*',     // 活用形
        basic_form: '黒文字',      // 基本形
        reading: 'クロモジ',       // 読み
        pronunciation: 'クロモジ'  // 発音
      } ]

```
