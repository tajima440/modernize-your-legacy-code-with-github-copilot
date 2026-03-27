# テストドキュメント - Node.js Student Account Management System

## 概要

このドキュメントは、Node.jsアカウント管理システムのテストスイートについて説明しています。
全67個のテストケースが、`docs/TESTPLAN.md` に記載された53個のテストケースに対応しています。

## テストフレームワーク

- **テストランナー**: Jest 29.x以上
- **テスト言語**: JavaScript
- **テストファイル**: `index.test.js`

## テストのセットアップ

### インストール

```bash
cd src/accounting
npm install --save-dev jest
```

### 実行方法

```bash
# 全テストを実行
npm test

# ウォッチモード（ファイル変更時に自動実行）
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

## テスト構造

テストスイートは以下の構造で組織されています：

### 1. DataProgram - データ層テスト (12テスト)

データ永続化とバランス管理を検証します。

**テストカテゴリ:**
- 初期化テスト
- READ操作テスト
- WRITE操作テスト
- フォーマット機能テスト

**関連テストケース:**
- TC-001, TC-035, TC-041, TC-042
- その他ヘルパーテスト

### 2. Operations - ビジネスロジック層テスト (28テスト)

アカウント操作のビジネスロジックを検証します。

**テストカテゴリ:**

#### TOTAL操作（残高表示）- 4テスト
- TC-005: 初期残高の表示
- TC-006: クレジット後の残高表示
- TC-007: デビット後の残高表示
- TC-008: 複数表示後の一貫性

#### CREDIT操作（入金）- 7テスト
- TC-009: 正常な入金
- TC-010: 複数回入金
- TC-011: 小数点精度
- TC-012: 大金額入金
- TC-013: ゼロ金額入金
- TC-014: 小額入金
- TC-015: 入金後のメニュー利用可能性

#### DEBIT操作 - 成功ケース（7テスト）
- TC-016: 正常な出金
- TC-017: 複数回出金
- TC-018: 小数点精度の出金
- TC-019: 残高と同額の出金
- TC-020: 小額出金
- TC-021: ゼロ金額出金
- TC-022: 出金後のメニュー利用可能性

#### DEBIT操作 - 失敗ケース（6テスト）
- TC-023: 残高不足での出金拒否
- TC-024: 出金失敗時の残高保持
- TC-025: 出金失敗後のメニュー利用可能性
- TC-026: 複数出金で残高不足
- TC-027: 小数点での残高不足
- TC-028: 余剰残高が必要な出金拒否

### 3. 統合テスト（6テスト）

複数操作の組み合わせを検証します。

**テストケース:**
- TC-029: 入金 → 残高表示 → 出金
- TC-030: 出金 → 残高表示 → 入金 → 残高表示
- TC-031: 複数の入金と出金の交互実行
- TC-032: 出金失敗 → 入金 → 出金成功
- TC-033: 境界値テスト（残高ジャスト）
- TC-034: 複数操作後のデータ一貫性

### 4. エッジケース・境界値テスト（6テスト）

極端な値と境界条件を検証します。

**テストケース:**
- TC-035: 最大値に近い入金
- TC-036: ゼロへの出金
- TC-037: ゼロ残高からの入金
- TC-038: ゼロ残高からの出金試行
- TC-039: 第3小数位の丸め処理
- TC-040: 負数入力の処理

### 5. データ整合性・永続化テスト（5テスト）

データの一貫性と永続性を検証します。

**テストケース:**
- TC-041: 入金後のデータ整合性
- TC-042: 出金後のデータ整合性
- TC-043: 複数操作時のデータ同期
- TC-044: READ操作の精度
- TC-045: WRITE操作の精度

### 6. UI・入力検証テスト（5テスト）

ユーザーインターフェースと入力検証を検証します。

**テストケース:**
- TC-046: メニュー表示構造
- TC-047: クレジットメッセージフォーマット
- TC-048: エラーメッセージの明確性
- TC-049: クレジット入力プロンプト
- TC-050: デビット入力プロンプト

### 7. パフォーマンス・ストレステスト（3テスト）

パフォーマンスと負荷に対する耐性を検証します。

**テストケース:**
- TC-051: 100回の高速操作
- TC-052: メニュー遷移のパフォーマンス
- TC-053: 大数値操作での精度維持

### 8. メニュー操作テスト（4テスト）

メニュー機能とユーザーお選択を検証します。

**テストケース:**
- TC-001: システム起動とメニュー準備
- TC-002: 有効なメニュー選択肢の処理
- TC-003: 無効なメニュー選択肢の処理
- TC-004: 終了選択肢の処理

## テスト実行例

### 全テスト実行
```bash
npm test

# 出力例:
# PASS  ./index.test.js
#  Student Account Management System - NodeJS
#    DataProgram - Data Layer
#      Initialization
#        ✓ TC-001: Should initialize with correct balance (4 ms)
#        ✓ Should initialize balance to exactly 1000.00 (1 ms)
#    ...
#
# Test Suites: 1 passed, 1 total
# Tests:       67 passed, 67 total
```

### ウォッチモード実行
```bash
npm run test:watch

# ファイルを編集すると、自動的にテストが再実行されます
```

### カバレッジレポート
```bash
npm run test:coverage

# coverage/ ディレクトリにレポートが生成されます
```

## テストの追加・修正

### 新しいテストケースの追加

```javascript
test('TC-XXX: 新しいテストの説明', () => {
  const data = new DataProgram();
  const ops = new Operations(data);
  
  // テストのセットアップ
  data.write(1000.00);
  
  // 検証
  expect(data.read()).toBe(1000.00);
});
```

### テストのグループ化

関連したテストは `describe()` でグループ化します：

```javascript
describe('新しい機能グループ', () => {
  test('テスト1', () => {
    // ...
  });
  
  test('テスト2', () => {
    // ...
  });
});
```

## テストのベストプラクティス

### 1. AAA パターンを使用
- **Arrange**: テストのセットアップ
- **Act**: テストの実行
- **Assert**: 結果の検証

```javascript
test('テスト例', () => {
  // Arrange
  const data = new DataProgram();
  
  // Act
  data.write(1500.00);
  
  // Assert
  expect(data.read()).toBe(1500.00);
});
```

### 2. 明確なテスト名
長くても正確なテスト名を付けることで、テスト失敗時に問題が明らかになります。

```javascript
// 良い例
test('TC-009: Should credit valid amount')

// 悪い例
test('credit test')
```

### 3. 単一責任
各テストは1つの振る舞いのみを検証します。

```javascript
// 良い例：1つの検証
expect(data.read()).toBe(1000.00);

// 悪い例：複数の検証
expect(data.read()).toBe(1000.00);
expect(data.storageBalance).toBe(1000.00);
```

## よくある問題とトラブルシューティング

### テストが遅い場合
```bash
# 並行実行数を制限
npm test -- --maxWorkers=1
```

### 特定のテストのみ実行
```bash
# "TC-001" を含むテストのみ実行
npm test -- --testNamePattern="TC-001"

# "DataProgram" グループのテストのみ実行
npm test -- --testNamePattern="DataProgram"
```

### デバッグモードでテスト実行
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## マッピング：COBOL テストケース → Node.js テスト

| COBOL テストケース範囲 | テスト数 | Node.js テストファイル | 説明 |
|-----------------|--------|------------------|------|
| TC-001～TC-004 | 4 | Menu Operations | メニュー操作 |
| TC-005～TC-008 | 4 | TOTAL Operation | 残高表示 |
| TC-009～TC-015 | 7 | CREDIT Operation | 入金 |
| TC-016～TC-022 | 7 | DEBIT Operation Success | 出金成功 |
| TC-023～TC-028 | 6 | DEBIT Operation Failure | 出金失敗 |
| TC-029～TC-034 | 6 | Integration Tests | 統合テスト |
| TC-035～TC-040 | 6 | Edge Cases | エッジケース |
| TC-041～TC-045 | 5 | Data Integrity | データ整合性 |
| TC-046～TC-050 | 5 | UI Validation | UI検証 |
| TC-051～TC-053 | 3 | Performance | パフォーマンス |
| **合計** | **53** | **index.test.js** | **全テストケース** |

## まとめ

このテストスイートは、元のCOBOLテストプラン（53テストケース）のすべては を完全にカバーしています。
Node.js版アプリケーションのビジネスロジック、データ整合性、パフォーマンスが
元のCOBOLアプリケーションと同等であることを保証します。

## 関連ドキュメント

- [テストプラン](../../docs/TESTPLAN.md) - COBOLアプリケーションの詳細テストプラン
- [README.md](./README.md) - Node.jsアプリケーションの概要
- [index.js](./index.js) - メインアプリケーションコード
