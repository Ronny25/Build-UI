import { PrismaClient } from '@prisma/client';
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { useEffect, useRef } from 'react';

export async function action({ request }: ActionFunctionArgs) {
  const db = new PrismaClient();

  const formData = await request.formData();
  const { date, type, text } = Object.fromEntries(formData);

  if (
    typeof date !== 'string' ||
    !Date.parse(date) ||
    typeof type !== 'string' ||
    typeof text !== 'string'
  ) {
    throw new Response('Invalid data', { status: 400 });
  }

  try {
    await new Promise((res) => setTimeout(res, 1000));

    await db.entry.create({
      data: {
        date: new Date(date),
        type,
        text,
      },
    });
  } finally {
    await db.$disconnect();
  }

  return redirect('/');
}

export async function loader() {
  const db = new PrismaClient();

  const entries = await db.entry.findMany();

  await db.$disconnect();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

export default function Index() {
  const entries = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      const monday = startOfWeek(parseISO(entry.date), { weekStartsOn: 1 });
      const mondayString = format(monday, 'yyyy-MM-dd');

      memo[mondayString] ||= [];
      memo[mondayString]?.push(entry);

      return memo;
    },
    {},
  );

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work:
        entriesByWeek[dateString]?.filter((entry) => entry.type === 'work') ??
        [],
      learnings:
        entriesByWeek[dateString]?.filter(
          (entry) => entry.type === 'learning',
        ) ?? [],
      interestingThings:
        entriesByWeek[dateString]?.filter(
          (entry) => entry.type === 'interesting-thing',
        ) ?? [],
    }));

  useEffect(() => {
    if (fetcher.state === 'idle' && textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
  }, [fetcher.state]);

  return (
    <div>
      <div className="my-8 border p-3">
        <p className="italic">Create an entry</p>

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
                defaultValue={format(new Date(), 'yyyy-MM-dd')}
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
                  defaultChecked
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
                />
                Learning
              </label>
              <label>
                <input
                  className="mr-1"
                  type="radio"
                  name="type"
                  value="interesting-thing"
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
      </div>

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), 'MMMM do')}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learnings</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryListItem({
  entry,
}: {
  entry: Awaited<ReturnType<typeof loader>>[number];
}) {
  return (
    <li className="group">
      {entry.text}

      <Link
        to={`entries/${entry.id}/edit`}
        className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
