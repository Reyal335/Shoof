import { CATEGORIES } from "../post-form";
import type { PostCategory } from "../types";
import { FieldError, FormSection } from "./form-section";

/** Section 1: the five category cards, real radios under visible labels so arrow keys work. */
export function CategoryPicker({ value, error, onChange }: { value: PostCategory | ""; error?: string; onChange: (value: PostCategory) => void }) {
  return (
    <FormSection number={1} title="Where does it belong?">
      <div className="field">
        <div className="cats" role="radiogroup" aria-labelledby="cat-lbl" aria-describedby="category-err" aria-invalid={error ? true : undefined}>
          <span className="sr" id="cat-lbl">Category</span>
          {CATEGORIES.map((c) => (
            <div className="cat" key={c.value}>
              <input type="radio" name="category" id={`cat-${c.value}`} value={c.value} checked={value === c.value} onChange={() => onChange(c.value)} />
              <label htmlFor={`cat-${c.value}`}>
                <b>{c.label}</b>
                <span>{c.hint}</span>
              </label>
            </div>
          ))}
        </div>
        <FieldError id="category-err" message={error} />
      </div>
    </FormSection>
  );
}
