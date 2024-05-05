import { PrismaClient } from '@prisma/client';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData } from '@remix-run/react';
import type { FormEvent } from 'react';
import { EntryForm } from '~/components/entry-form';
import { getSession } from '~/session';

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404, statusText: 'Not found' });
  }

  const db = new PrismaClient();

  const entry = await db.entry.findUnique({
    where: { id: Number(params.entryId) },
  });

  await db.$disconnect();

  if (!entry) {
    throw new Response('Not found', { status: 404, statusText: 'Not found' });
  }

  const session = await getSession(request.headers.get('Cookie'));
  if (session.data.isAdmin !== true) {
    throw new Response('Not authenticated', {
      status: 401,
      statusText: 'Not authenticated',
    });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (session.data.isAdmin !== true) {
    throw new Response('Not authenticated', {
      status: 401,
      statusText: 'Not authenticated',
    });
  }

  if (typeof params.entryId !== 'string') {
    throw new Response('Not found', { status: 404, statusText: 'Not found' });
  }

  const db = new PrismaClient();

  const formData = await request.formData();
  const { _action, date, type, text } = Object.fromEntries(formData);

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
      <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
        <p className="mb-4 text-sm font-medium text-gray-500 lg:text-base">
          Edit entry
        </p>

        <EntryForm entry={entry} />
      </div>

      <div className="mt-8">
        <Form method="post" onSubmit={handleSubmit}>
          <button
            className="text-sm text-gray-600 underline"
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
