import { useFetcher } from '@remix-run/react';
import { useRef } from 'react';

type Props = {
  entry: {
    text: string;
    date: string;
    type: string;
  };
};

export function EntryForm({ entry }: Props) {
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <fetcher.Form method="post">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state === 'submitting'}
      >
        <div className="mt-2">
          <input
            className="text-gray-700"
            type="date"
            name="date"
            defaultValue={entry.date}
            required
          />
        </div>

        <div className="mt-2 space-x-6">
          <label>
            <input
              className="mr-1"
              type="radio"
              name="type"
              value="work"
              defaultChecked={entry.type === 'work'}
              required
            />
            Work
          </label>
          <label>
            <input
              className="mr-1"
              type="radio"
              name="type"
              value="learning"
              defaultChecked={entry.type === 'learning'}
            />
            Learning
          </label>
          <label>
            <input
              className="mr-1"
              type="radio"
              name="type"
              value="interesting-thing"
              defaultChecked={entry.type === 'interesting-thing'}
            />
            Interesting thing
          </label>
        </div>

        <div className="mt-2">
          <textarea
            ref={textareaRef}
            className="w-full text-gray-700"
            name="text"
            placeholder="Write your entry..."
            defaultValue={entry.text}
            required
          />
        </div>

        <div className="mt-1 text-right">
          <button
            className="bg-blue-500 px-4 py-1 font-medium text-white"
            type="submit"
          >
            {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
