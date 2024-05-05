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
    throw new Response('Not authenticated', {
      status: 401,
      statusText: 'Not authenticated',
    });
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
    throw new Response('Invalid data', {
      status: 400,
      statusText: 'Invalid data',
    });
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
  const entries = await db.entry.findMany({ orderBy: { date: 'desc' } });

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

  const weeks = Object.keys(entriesByWeek).map((dateString) => ({
    dateString,
    work:
      entriesByWeek[dateString]?.filter((entry) => entry.type === 'work') ?? [],
    learnings:
      entriesByWeek[dateString]?.filter((entry) => entry.type === 'learning') ??
      [],
    interestingThings:
      entriesByWeek[dateString]?.filter(
        (entry) => entry.type === 'interesting-thing',
      ) ?? [],
  }));

  return (
    <div>
      {session.isAdmin && (
        <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
          <p className="mb-4 text-sm font-medium text-gray-500 lg:text-base">
            New entry
          </p>

          <EntryForm />
        </div>
      )}

      <div className="mt-12 space-y-12 border-l-2 border-sky-500/[.15] pl-6 lg:space-y-20 lg:pl-8">
        {weeks.map((week) => (
          <div key={week.dateString} className="relative">
            <div className="absolute left-[-38px] rounded-full bg-gray-900 p-2 lg:left-[-45px]">
              <div className="h-[10px] w-[10px] rounded-full border border-sky-500 bg-gray-900" />
            </div>

            <p className="pt-[5px] text-xs font-semibold uppercase tracking-wider text-sky-500 lg:pt-[3px] lg:text-sm">
              {format(parseISO(week.dateString), 'MMMM d, yyyy')}
            </p>

            <div className="mt-6 space-y-8 lg:space-y-12">
              <EntryList entries={week.work} label="Work" />
              <EntryList entries={week.learnings} label="Learnings" />
              <EntryList
                entries={week.interestingThings}
                label="Interesting things"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Entries = Awaited<ReturnType<typeof loader>>['entries'];

function EntryList({ entries, label }: { entries: Entries; label: string }) {
  return (
    entries.length > 0 && (
      <div>
        <p className="font-semibold text-white">{label}</p>
        <ul className="mt-4 space-y-6">
          {entries.map((entry) => (
            <EntryListItem key={entry.id} entry={entry} />
          ))}
        </ul>
      </div>
    )
  );
}

function EntryListItem({ entry }: { entry: Entries[number] }) {
  const { session } = useLoaderData<typeof loader>();

  return (
    <li className="group leading-7">
      {entry.text}

      {session.isAdmin && (
        <Link
          to={`entries/${entry.id}/edit`}
          className="ml-2 text-sky-500 opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
      )}
    </li>
  );
}
