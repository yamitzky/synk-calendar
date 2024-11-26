# Synk Calendar

Synk Calendarは、Google Calendarの内容を表示するためのWebアプリケーションです。

シフトの共有やプライベートイベントの共有など、「無料でカレンダーの表示だけできるようにしたい」というユースケースを想定し、開発されています。

## 機能

- Google Calendarとの連携
- 月表示、週表示、4日表示、日表示の切り替え
- モバイル/PC対応
- イベントの詳細表示
- リマインダー (Experimental)
- 多言語対応 (i18n)

## 技術スタックと利用ライブラリ

- TypeScript
- React
- Remix
- Google Calendar API
- FullCalendar

## 開発環境のセットアップ

1. リポジトリをクローンします：

```bash
git clone https://github.com/yamitzky/synk-calendar.git
cd synk-calendar
```

2. 依存関係をインストールします：

```bash
pnpm install
```

3. 環境変数を設定します。`.env`ファイルを作成し、必要な変数を設定してください：

```
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_AUTH_SUBJECT=your-email@example.com
CALENDAR_IDS=id1,id2,id3
# 以降の環境変数は、リマインダーを使う場合のみ必要です
REMINDER_SETTINGS=[{"minutesBefore":10,"notificationType":"console"},{"minutesBefore":30,"notificationType":"webhook"}]
WEBHOOK_URL=https://your-webhook-url.com
# リマインダーのテンプレート文をカスタマイズしたい場合は設定してください(Eta)
REMINDER_TEMPLATE="Reminder: <%= it.title %> starts in <%= it.minutesBefore %> minutes."
```

4. 開発サーバーを起動します：

```bash
pnpm dev
```

アプリケーションは http://localhost:5173で利用可能になります。

## ビルドと本番環境での実行

1. アプリケーションをビルドします：

```bash
pnpm build
```

2. 本番環境でアプリケーションを実行します：

```bash
pnpm start
```

## テスト

テストを実行するには：

```bash
pnpm test
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
