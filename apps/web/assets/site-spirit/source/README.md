# 小精灵素材目录

把原始雪碧图放在这里，然后运行：

```bash
pnpm sprites:process
```

## 网格模式（当前）

| 文件 | 说明 |
|------|------|
| `character-grid.jpg` | **8×8 网格**，每行 8 帧、一行一个状态；第 8 行会被排除 |

配置见 `../grid.config.json`（7 个状态 × 8 帧，黑底抠图）。

## 横排模式（旧）

若删除 `grid.config.json`，脚本会回退到 `../sheets.config.json` + `idle-sheet.jpg` 等横排素材。

## 输出位置

脚本会生成透明 PNG 到 `apps/web/public/site-spirit/`，并更新 `sprite-sheets.generated.ts`。
