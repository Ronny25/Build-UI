import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { PrismaClient } from '@prisma/client';

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

export default function Index() {
  const fetcher = useFetcher();

  return (
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-8 border p-3">
        <fetcher.Form method="post">
          <p className="italic">Create an entry</p>

          <div>
            <div className="mt-4">
              <input
                className="text-gray-700"
                type="date"
                name="date"
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
          </div>
        </fetcher.Form>
      </div>

      <div className="mt-6">
        <p className="font-bold">
          Week of April 14<sup>th</sup>
        </p>
      </div>

      <div className="mt-3 space-y-4">
        <div>
          <p>Work</p>
          <ul className="ml-8 list-disc">
            <li>First item</li>
            <li>Second Item</li>
          </ul>
        </div>
        <div>
          <p>Learnings</p>
          <ul className="ml-8 list-disc">
            <li>First item</li>
            <li>Second Item</li>
          </ul>
        </div>
        <div>
          <p>Interesting things</p>
          <ul className="ml-8 list-disc">
            <li>First item</li>
            <li>Second Item</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
