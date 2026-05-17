# pi issue 4598 pressure test

Files:
- `tall-390x2400.png` - extra-tall portrait PNG with `y=<px>px` row markers every 100px so you can see the vertical clip point
- `generate-row-marked-png.py` - regenerate the marked PNG fixture
- `tall-image-tool.js` - minimal extension tool that returns the PNG as an image tool result
- `prompt.txt` - short prompt that asks pi to call the tool once
- `run-installed-pi.sh` - launches interactive pi against the local extension

Run from this directory:

```bash
cd packages/coding-agent/examples/issue-4598-pressure-test
./run-installed-pi.sh
```

Expected on 0.74.1:
- the inline tool-image preview can render very tall, about 30 rows at the default 60-cell width even though the source image is much taller
- the visible row markers let you see exactly where the preview is clipping vertically

Expected with the experimental patch branch:
- the same preview is capped to 10 rows
