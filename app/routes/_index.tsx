import { PrismaClient } from '@prisma/client';
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { format, parseISO, startOfWeek } from 'date-fns';
import { EntryForm } from '~/components/entry-form';
import { getSession } from '~/session';

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.data.isAdmin !== true) {
    throw new Response('Not authenticated', { status: 401 });
  }

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

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  const db = new PrismaClient();
  const entries = await db.entry.findMany();

  await db.$disconnect();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export default function Index() {
  const { session, entries } = useLoaderData<typeof loader>();

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

  return (
    <div>
      {session.isAdmin && (
        <div className="my-8 border p-3">
          <p className="italic">Create an entry</p>

          <EntryForm />
        </div>
      )}

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
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learnings</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
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
  canEdit,
}: {
  entry: Awaited<ReturnType<typeof loader>>['entries'][number];
  canEdit: boolean;
}) {
  return (
    <li className="group">
      {entry.text}

      {canEdit && (
        <Link
          to={`entries/${entry.id}/edit`}
          className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
      )}
    </li>
  );
}
