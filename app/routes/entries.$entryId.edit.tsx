import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData } from '@remix-run/react';
import { EntryForm } from '~/components/entry-form';

export async function loader({ params }: LoaderFunctionArgs) {
  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404 });
  }

  const db = new PrismaClient();

  const entry = await db.entry.findUnique({
    where: { id: Number(params.entryId) },
  });

  await db.$disconnect();

  if (!entry) {
    throw new Response('Not found', { status: 404 });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404 });
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

    await db.entry.update({
      where: { id: Number(params.entryId) },
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

export default function EditEntryPage() {
  const entry = useLoaderData<typeof loader>();

  return (
    <div className="mt-4">
      <p>Editing entry {entry.id}</p>
      <div className="mt-8">
        <EntryForm entry={entry} />
      </div>
    </div>
  );
}
