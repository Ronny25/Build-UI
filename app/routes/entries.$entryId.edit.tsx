import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData } from '@remix-run/react';
import type { FormEvent } from 'react';
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
  const { _action, date, type, text } = Object.fromEntries(formData);

  await new Promise((res) => setTimeout(res, 1000));

  if (_action === 'delete') {
    await db.entry.delete({
      where: { id: Number(params.entryId) },
    });

    await db.$disconnect();

    return redirect('/');
  }

  if (
    typeof date !== 'string' ||
    !Date.parse(date) ||
    typeof type !== 'string' ||
    typeof text !== 'string'
  ) {
    throw new Response('Invalid data', { status: 400 });
  }

  try {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!confirm('Are you sure?')) {
      event.preventDefault();
    }
  }

  return (
    <div className="mt-4">
      <p>Editing entry {entry.id}</p>
      <div className="mt-8">
        <EntryForm entry={entry} />
      </div>

      <div className="mt-8">
        <Form method="post" onSubmit={handleSubmit}>
          <button
            className="text-gray-500 underline"
            name="_action"
            value="delete"
          >
            Delete this entry...
          </button>
        </Form>
      </div>
    </div>
  );
}
