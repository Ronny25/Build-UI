import { useFetcher, useNavigation } from '@remix-run/react';
import { format } from 'date-fns';
import { useEffect, useRef } from 'react';

type Props = {
  entry?: {
    text: string;
    date: string;
    type: string;
  };
};

export function EntryForm({ entry }: Props) {
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const init = fetcher.formMethod === undefined && navigation.state === 'idle';

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!init && fetcher.state === 'idle' && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
  }, [fetcher.state, init]);

  return (
    <fetcher.Form method="post">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state !== 'idle'}
      >
        <div className="mt-2">
          <input
            className="text-gray-700"
            type="date"
            name="date"
            defaultValue={entry?.date ?? format(new Date(), 'yyyy-MM-dd')}
            required
          />
        </div>

        <div className="mt-2 space-x-6">
          {[
            { label: 'Work', value: 'work' },
            { label: 'Learning', value: 'learning' },
            { label: 'Interesting thing', value: 'interesting-thing' },
          ].map(({ label, value }) => (
            <label key={value} className="inline-block">
              <input
                className="mr-1"
                type="radio"
                name="type"
                value={value}
                defaultChecked={value === (entry?.type ?? 'work')}
                required
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-2">
          <textarea
            ref={textareaRef}
            className="w-full text-gray-700"
            name="text"
            placeholder="Write your entry..."
            defaultValue={entry?.text}
            required
          />
        </div>

        <div className="mt-1 text-right">
          <button
            className="bg-blue-500 px-4 py-1 font-medium text-white"
            type="submit"
          >
            {fetcher.state !== 'idle' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
