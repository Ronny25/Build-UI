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
        <div className="space-y-6">
          <div>
            <input
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              style={{ colorScheme: 'dark' }}
              type="date"
              name="date"
              defaultValue={entry?.date ?? format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="flex space-x-4 text-sm">
            {[
              { label: 'Work', value: 'work' },
              { label: 'Learning', value: 'learning' },
              { label: 'Interesting thing', value: 'interesting-thing' },
            ].map(({ label, value }) => (
              <label key={value} className="inline-block text-white">
                <input
                  className="mr-2 border-gray-700 bg-gray-800 text-sky-600 focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900"
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

          <div>
            <textarea
              ref={textareaRef}
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              name="text"
              placeholder="Write your entry..."
              defaultValue={entry?.text}
              rows={3}
              required
            />
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            className="w-full rounded-md bg-sky-600 px-3 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900"
            type="submit"
          >
            {fetcher.state !== 'idle' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
