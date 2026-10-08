import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { flushSync } from "react-dom";
import type { Screenshots } from "../hooks/use-screenshots";
import { SCREENSHOT_TYPES } from "../post-form";
import { FieldError, FormSection } from "./form-section";

/** Section 5: the drop zone (a real file input stretched over it) and the thumbnails with Cover / Make cover / Remove. */
export function ScreenshotPicker({ shots }: { shots: Screenshots }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  function firstThumbButton() {
    return listRef.current?.querySelector<HTMLButtonElement>(".mini") ?? null;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setOver(true);
  }

  return (
    <FormSection number={5} title="Screenshots" optional>
      <div className="field">
        <div
          className={over ? "drop over" : "drop"}
          onDragEnter={onDragOver}
          onDragOver={onDragOver}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            shots.add(Array.from(e.dataTransfer.files));
          }}
        >
          <input
            ref={inputRef}
            type="file"
            id="files"
            accept={SCREENSHOT_TYPES.join(",")}
            multiple
            aria-describedby="files-hint files-err"
            aria-label="Add screenshots"
            onChange={(e) => {
              shots.add(Array.from(e.target.files ?? []));
              e.target.value = ""; // so the same file can be picked again
            }}
          />
          <b>Add screenshots</b>
          <span>Drag images here or click to choose</span>
        </div>
        <span className="hint" id="files-hint">PNG, JPG, WebP or GIF, up to 5 MB each, up to 6 images. The first one is the cover.</span>
        <FieldError id="files-err" message={shots.error} />
      </div>
      <ul className="thumbs" ref={listRef} aria-label="Added screenshots" hidden={!shots.items.length}>
        {shots.items.map((shot, i) => (
          <li className="thumb" key={shot.url}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a local blob: URL, nothing for next/image to optimise */}
            <img src={shot.url} alt={`Screenshot ${i + 1} preview`} />
            <div className="meta">
              {i === 0 && <span className="cover">Cover</span>}
              <span className="nm">{shot.file.name}</span>
              <div className="acts">
                {i > 0 && (
                  <button
                    type="button"
                    className="mini"
                    aria-label={`Make screenshot ${i + 1} the cover`}
                    onClick={() => {
                      flushSync(() => shots.makeCover(i));
                      firstThumbButton()?.focus();
                    }}
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  className="mini rm"
                  aria-label={`Remove screenshot ${i + 1}`}
                  onClick={() => {
                    flushSync(() => shots.remove(i));
                    (firstThumbButton() ?? inputRef.current)?.focus();
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="sr" role="status" aria-live="polite">{shots.announcement}</div>
    </FormSection>
  );
}
